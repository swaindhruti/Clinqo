"""add clinic_id and doctor_id to users

Revision ID: a20260405_userlinks
Revises: a20260405_proc
Create Date: 2026-04-05 22:35:00.000000
"""

from alembic import op


# revision identifiers, used by Alembic.
revision = "a20260405_userlinks"
down_revision = "a20260405_proc"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute(
        """
        ALTER TABLE users
        ADD COLUMN IF NOT EXISTS clinic_id UUID;
        """
    )

    op.execute(
        """
        ALTER TABLE users
        ADD COLUMN IF NOT EXISTS doctor_id UUID;
        """
    )

    op.execute(
        """
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1
                FROM pg_constraint
                WHERE conname = 'fk_users_clinic_id'
            ) THEN
                ALTER TABLE users
                ADD CONSTRAINT fk_users_clinic_id
                FOREIGN KEY (clinic_id) REFERENCES clinics(id);
            END IF;
        END $$;
        """
    )

    op.execute(
        """
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1
                FROM pg_constraint
                WHERE conname = 'fk_users_doctor_id'
            ) THEN
                ALTER TABLE users
                ADD CONSTRAINT fk_users_doctor_id
                FOREIGN KEY (doctor_id) REFERENCES doctor_masters(id);
            END IF;
        END $$;
        """
    )


def downgrade() -> None:
    op.execute(
        """
        ALTER TABLE users
        DROP CONSTRAINT IF EXISTS fk_users_doctor_id;
        """
    )

    op.execute(
        """
        ALTER TABLE users
        DROP CONSTRAINT IF EXISTS fk_users_clinic_id;
        """
    )

    op.execute(
        """
        ALTER TABLE users
        DROP COLUMN IF EXISTS doctor_id;
        """
    )

    op.execute(
        """
        ALTER TABLE users
        DROP COLUMN IF EXISTS clinic_id;
        """
    )
