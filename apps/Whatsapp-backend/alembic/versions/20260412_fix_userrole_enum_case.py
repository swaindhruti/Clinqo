"""fix userrole enum case to uppercase

Revision ID: 20260412_userrole_case
Revises: 20260406_users
Create Date: 2026-04-12 01:00:00.000000
"""

from alembic import op


# revision identifiers, used by Alembic.
revision = "20260412_userrole_case"
down_revision = "20260406_users"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute(
        """
        DO $$
        BEGIN
            IF EXISTS (
                SELECT 1 FROM pg_type t
                JOIN pg_enum e ON e.enumtypid = t.oid
                WHERE t.typname = 'userrole' AND e.enumlabel = 'admin'
            ) THEN
                ALTER TYPE userrole RENAME VALUE 'admin' TO 'ADMIN';
            END IF;

            IF EXISTS (
                SELECT 1 FROM pg_type t
                JOIN pg_enum e ON e.enumtypid = t.oid
                WHERE t.typname = 'userrole' AND e.enumlabel = 'clinic'
            ) THEN
                ALTER TYPE userrole RENAME VALUE 'clinic' TO 'CLINIC';
            END IF;

            IF EXISTS (
                SELECT 1 FROM pg_type t
                JOIN pg_enum e ON e.enumtypid = t.oid
                WHERE t.typname = 'userrole' AND e.enumlabel = 'doctor'
            ) THEN
                ALTER TYPE userrole RENAME VALUE 'doctor' TO 'DOCTOR';
            END IF;
        END $$;
        """
    )


def downgrade() -> None:
    op.execute(
        """
        DO $$
        BEGIN
            IF EXISTS (
                SELECT 1 FROM pg_type t
                JOIN pg_enum e ON e.enumtypid = t.oid
                WHERE t.typname = 'userrole' AND e.enumlabel = 'ADMIN'
            ) THEN
                ALTER TYPE userrole RENAME VALUE 'ADMIN' TO 'admin';
            END IF;

            IF EXISTS (
                SELECT 1 FROM pg_type t
                JOIN pg_enum e ON e.enumtypid = t.oid
                WHERE t.typname = 'userrole' AND e.enumlabel = 'CLINIC'
            ) THEN
                ALTER TYPE userrole RENAME VALUE 'CLINIC' TO 'clinic';
            END IF;

            IF EXISTS (
                SELECT 1 FROM pg_type t
                JOIN pg_enum e ON e.enumtypid = t.oid
                WHERE t.typname = 'userrole' AND e.enumlabel = 'DOCTOR'
            ) THEN
                ALTER TYPE userrole RENAME VALUE 'DOCTOR' TO 'doctor';
            END IF;
        END $$;
        """
    )
