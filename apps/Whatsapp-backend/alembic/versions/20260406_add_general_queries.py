"""add general_queries table

Revision ID: a20260406_queries
Revises: a20260406_svcats
Create Date: 2026-04-06 01:05:00.000000
"""

from alembic import op


# revision identifiers, used by Alembic.
revision = "a20260406_queries"
down_revision = "a20260406_svcats"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute(
        """
        CREATE TABLE IF NOT EXISTS general_queries (
            id UUID PRIMARY KEY,
            clinic_id UUID NOT NULL REFERENCES clinics(id),
            patient_id UUID REFERENCES patients(id),
            patient_phone VARCHAR(20) NOT NULL,
            patient_name VARCHAR(200) NOT NULL,
            query_text TEXT NOT NULL,
            status VARCHAR(50) NOT NULL DEFAULT 'pending',
            created_at TIMESTAMPTZ
        );
        """
    )

    op.execute(
        """
        CREATE INDEX IF NOT EXISTS ix_general_queries_clinic_status
        ON general_queries (clinic_id, status, created_at);
        """
    )


def downgrade() -> None:
    op.execute(
        """
        DROP INDEX IF EXISTS ix_general_queries_clinic_status;
        """
    )
    op.execute(
        """
        DROP TABLE IF EXISTS general_queries;
        """
    )
