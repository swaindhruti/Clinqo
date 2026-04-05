"""add service_categories table

Revision ID: a20260406_svcats
Revises: a20260405_clinicfix
Create Date: 2026-04-06 00:45:00.000000
"""

from alembic import op


# revision identifiers, used by Alembic.
revision = "a20260406_svcats"
down_revision = "a20260405_clinicfix"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute(
        """
        CREATE TABLE IF NOT EXISTS service_categories (
            id UUID PRIMARY KEY,
            clinic_id UUID NOT NULL REFERENCES clinics(id),
            visit_type VARCHAR(50) NOT NULL,
            name VARCHAR(200) NOT NULL,
            price VARCHAR(50),
            emoji VARCHAR(10),
            sort_order INTEGER NOT NULL DEFAULT 0,
            detail_questions TEXT,
            created_at TIMESTAMPTZ
        );
        """
    )

    op.execute(
        """
        CREATE INDEX IF NOT EXISTS ix_service_categories_clinic_visit
        ON service_categories (clinic_id, visit_type, sort_order);
        """
    )


def downgrade() -> None:
    op.execute(
        """
        DROP INDEX IF EXISTS ix_service_categories_clinic_visit;
        """
    )
    op.execute(
        """
        DROP TABLE IF EXISTS service_categories;
        """
    )
