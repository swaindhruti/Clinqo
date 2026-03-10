import requests
import datetime
import sys

BASE_URL = "http://localhost:8000/api/v1"

DOCTORS = [
    {
        "name": "Dr. Smith Sandbox",
        "code": "DR_SMITH_002",
        "specialty": "Cardiology"
    },
    {
        "name": "Dr. Emily Chen",
        "code": "DR_CHEN_003",
        "specialty": "Pediatrics"
    },
    {
        "name": "Dr. Marcus Johnson",
        "code": "DR_JOHNSON_004",
        "specialty": "Neurology"
    },
    {
        "name": "Dr. Sarah Williams",
        "code": "DR_WILLIAMS_005",
        "specialty": "Dermatology"
    },
    {
        "name": "Dr. Michael Brown",
        "code": "DR_BROWN_006",
        "specialty": "Orthopedics"
    }
]

def create_doctor(payload):
    print(f"Creating Doctor: {payload['name']}...")
    
    response = requests.post(f"{BASE_URL}/doctors", json=payload)
    if response.status_code in [200, 201]:
        data = response.json()
        print(f"Success! Doctor ID: {data['id']}")
        return data['id']
    else:
        print(f"Failed to create doctor (maybe already exists code?). Status: {response.status_code}")
        # Try fetching doctors
        resp = requests.get(f"{BASE_URL}/doctors")
        if resp.status_code == 200:
            doctors = resp.json()
            for doc in doctors:
                if doc['code'] == payload['code']:
                    print(f"Using existing doctor ID: {doc['id']}")
                    return doc['id']
            if doctors:
                print(f"Falling back to first existing doctor ID: {doctors[0]['id']}")
                return doctors[0]['id']
        return None

def set_availability(doctor_id):
    if not doctor_id:
        return
    print(f"Setting availability for {doctor_id}...")
    today = datetime.datetime.now().strftime("%Y-%m-%d")
    tomorrow = (datetime.datetime.now() + datetime.timedelta(days=1)).strftime("%Y-%m-%d")
    next_day = (datetime.datetime.now() + datetime.timedelta(days=2)).strftime("%Y-%m-%d")
    
    dates = [today, tomorrow, next_day]
    for date in dates:
        payload = {
            "date": date,
            "is_present": True,
            "notes": "Regular shift"
        }
        resp = requests.post(f"{BASE_URL}/doctors/{doctor_id}/availability", json=payload)
        if resp.status_code in [200, 201]:
            print(f"Availability set for {date}")
        else:
            print(f"Failed to set availability for {date} (maybe already set?). Status: {resp.status_code}")

if __name__ == "__main__":
    first_doc_id = None
    for idx, doc_data in enumerate(DOCTORS):
        doc_id = create_doctor(doc_data)
        if idx == 0 and doc_id:
            first_doc_id = doc_id
        set_availability(doc_id)
        print("-" * 30)
        
    print(f"\n\n--- SCRIPT COMPLETE ---")
    if first_doc_id:
        print(f"Update your Next.js DEMO_DOCTOR_ID to: {first_doc_id}")
