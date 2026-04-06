"""Clear all data from specific tables: clinics, doctors, appointments, procedures"""
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import delete, text
from app.models import Clinic, DoctorMaster, Appointment, ProcedureBooking, ServiceCategory, DoctorWeeklySlot, GeneralQuery, QueueEntry

DATABASE_URL = "postgresql+asyncpg://postgres:postgres@localhost:5432/appointment_db"

async def clear_data():
    """Delete all clinics, doctors, appointments, and procedures"""
    print("=" * 60)
    print("CLEARING DATA FROM DATABASE")
    print("=" * 60)
    
    engine = create_async_engine(DATABASE_URL, echo=False)
    
    try:
        async with engine.begin() as conn:
            # Order matters due to foreign key constraints
            print("\n🗑️  Clearing QueueEntry...")
            await conn.execute(delete(QueueEntry))
            
            print("🗑️  Clearing Appointments...")
            await conn.execute(delete(Appointment))
            
            print("🗑️  Clearing ProcedureBooking...")
            await conn.execute(delete(ProcedureBooking))
            
            print("🗑️  Clearing GeneralQuery...")
            await conn.execute(delete(GeneralQuery))
            
            print("🗑️  Clearing DoctorWeeklySlot...")
            await conn.execute(delete(DoctorWeeklySlot))
            
            print("🗑️  Clearing ServiceCategory...")
            await conn.execute(delete(ServiceCategory))
            
            print("🗑️  Clearing DoctorMaster...")
            await conn.execute(delete(DoctorMaster))
            
            print("🗑️  Clearing Clinic...")
            await conn.execute(delete(Clinic))
            
            # Reset sequences for PostgreSQL
            print("\n♻️  Resetting sequences...")
            await conn.execute(text("ALTER SEQUENCE clinic_id_seq RESTART WITH 1"))
            await conn.execute(text("ALTER SEQUENCE doctor_master_id_seq RESTART WITH 1"))
            await conn.execute(text("ALTER SEQUENCE appointment_id_seq RESTART WITH 1"))
            await conn.execute(text("ALTER SEQUENCE procedure_booking_id_seq RESTART WITH 1"))
        
        print("\n✅ All data cleared successfully!")
        print("=" * 60)
        
    except Exception as e:
        print(f"\n❌ Error clearing data: {e}")
        raise
    finally:
        await engine.dispose()


if __name__ == "__main__":
    asyncio.run(clear_data())
