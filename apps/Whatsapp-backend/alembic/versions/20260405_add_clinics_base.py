"""add clinics base table

Revision ID: a20260405_clinics
Revises: a20260405_intake
Create Date: 2026-04-05 00:40:00.000000
"""

from alembic import op


# revision identifiers, used by Alembic.
revision = "a20260405_clinics"
down_revision = "a20260405_intake"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute(
        """
        CREATE TABLE IF NOT EXISTS clinics (
            id UUID PRIMARY KEY,
            name VARCHAR(200) NOT NULL,
            address VARCHAR(500),
            created_at TIMESTAMPTZ
        );
        """
    )


def downgrade() -> None:
    op.execute(
        """
        DROP TABLE IF EXISTS clinics;
        """
    )
