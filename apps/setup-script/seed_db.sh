#!/bin/bash

BASE_URL="http://localhost:8000/api/v1"

# Define doctors as an array of JSON objects
DOCTORS=(
  '{"name": "Dr. Smith Sandbox", "code": "DR_SMITH_002", "specialty": "Cardiology"}'
  '{"name": "Dr. Emily Chen", "code": "DR_CHEN_003", "specialty": "Pediatrics"}'
  '{"name": "Dr. Marcus Johnson", "code": "DR_JOHNSON_004", "specialty": "Neurology"}'
  '{"name": "Dr. Sarah Williams", "code": "DR_WILLIAMS_005", "specialty": "Dermatology"}'
  '{"name": "Dr. Michael Brown", "code": "DR_BROWN_006", "specialty": "Orthopedics"}'
)

FIRST_DOC_ID=""

for DOCTOR_JSON in "${DOCTORS[@]}"; do
    DOC_NAME=$(echo "$DOCTOR_JSON" | grep -o '"name": *"[^"]*"' | cut -d'"' -f4)
    
    echo "Creating Doctor: $DOC_NAME..."
    
    # Create Doctor
    DOCTOR_RES=$(curl -s -X POST "$BASE_URL/doctors" \
      -H "Content-Type: application/json" \
      -d "$DOCTOR_JSON")

    if [[ $DOCTOR_RES == *"id"* ]]; then
        # Extract the doctor_id strictly from the JSON response
        DOC_ID=$(echo "$DOCTOR_RES" | grep -o '"id":"[^"]*' | head -1 | grep -o '[^"]*$')
        echo "Success! Doctor ID: $DOC_ID"
    else
        echo "Failed to create doctor (maybe already exists code?). Trying to find existing doctor..."
        GET_RES=$(curl -s -X GET "$BASE_URL/doctors")
        
        # We'll just grab any ID for fallback if it already exists to simplify bash JSON parsing
        DOC_ID=$(echo "$GET_RES" | grep -o '"id":"[^"]*' | head -1 | grep -o '[^"]*$')
        echo "Using existing doctor ID: $DOC_ID"
    fi

    if [ -z "$DOC_ID" ]; then
        echo "Could not parse or retrieve Doctor ID. Skipping availability setup."
        continue
    fi
    
    if [ -z "$FIRST_DOC_ID" ]; then
        FIRST_DOC_ID="$DOC_ID"
    fi

    echo "Setting availability for $DOC_ID..."

    # Set availability for today, tomorrow, and next day
    for i in {0..2}
    do
       DATE=$(date -d "+$i days" +%Y-%m-%d)
       RES=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/doctors/$DOC_ID/availability" \
          -H "Content-Type: application/json" \
          -d "{
            \"date\": \"$DATE\",
            \"is_present\": true,
            \"notes\": \"Regular shift\"
          }")
       
       if [ "$RES" -eq 200 ] || [ "$RES" -eq 201 ]; then
           echo "Availability set for $DATE"
       else
           echo "Failed to set availability for $DATE. HTTP Status: $RES"
       fi
    done
    echo "--------------------------"
done

echo ""
echo "--- SCRIPT COMPLETE ---"
if [ -n "$FIRST_DOC_ID" ]; then
    echo "Set your Next.js DEMO_DOCTOR_ID to: $FIRST_DOC_ID"

    # Optionally update the typescript files automatically
    sed -i "s/123e4567-e89b-12d3-a456-426614174000/$FIRST_DOC_ID/g" apps/web/components/features/dashboard/doctor/appointments/appointments-section.tsx
    sed -i "s/123e4567-e89b-12d3-a456-426614174000/$FIRST_DOC_ID/g" apps/web/components/features/dashboard/doctor/schedule/schedule-section.tsx
    echo "Successfully updated Next.js dashboard components with the new Demo Doctor UUID!"
fi
