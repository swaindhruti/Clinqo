"""ensure doctor_masters has clinic_id

Revision ID: 20260413_doctor_clinic_id
Revises: 20260413_merge_heads
Create Date: 2026-04-13
"""

from alembic import op


# revision identifiers, used by Alembic.
revision = "20260413_doctor_clinic_id"
down_revision = "20260413_merge_heads"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute(
        """
        DO $$
        BEGIN
            IF to_regclass('public.doctor_masters') IS NOT NULL THEN
                ALTER TABLE doctor_masters
                ADD COLUMN IF NOT EXISTS clinic_id UUID;
            END IF;
        END $$;
        """
    )

    op.execute(
        """
        DO $$
        BEGIN
            IF to_regclass('public.doctor_masters') IS NOT NULL
               AND to_regclass('public.clinics') IS NOT NULL
               AND NOT EXISTS (
                   SELECT 1
                   FROM pg_constraint
                   WHERE conname = 'fk_doctor_masters_clinic_id'
               ) THEN
                ALTER TABLE doctor_masters
                ADD CONSTRAINT fk_doctor_masters_clinic_id
                FOREIGN KEY (clinic_id) REFERENCES clinics(id);
            END IF;
        END $$;
        """
    )


def downgrade() -> None:
    op.execute(
        """
        DO $$
        BEGIN
            IF to_regclass('public.doctor_masters') IS NOT NULL THEN
                ALTER TABLE doctor_masters
                DROP CONSTRAINT IF EXISTS fk_doctor_masters_clinic_id;
            END IF;
        END $$;
        """
    )

    op.execute(
        """
        DO $$
        BEGIN
            IF to_regclass('public.doctor_masters') IS NOT NULL THEN
                ALTER TABLE doctor_masters
                DROP COLUMN IF EXISTS clinic_id;
            END IF;
        END $$;
        """
    )
