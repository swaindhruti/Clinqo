"""add procedure bookings table

Revision ID: 20260405_add_procedure_bookings
Revises: 20260405_add_weekly_slots_and_visit_type
Create Date: 2026-04-05 01:10:00.000000
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "20260405_add_procedure_bookings"
down_revision = "20260405_add_weekly_slots_and_visit_type"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "procedure_bookings",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("clinic_id", sa.UUID(), nullable=False),
        sa.Column("patient_id", sa.UUID(), nullable=False),
        sa.Column("sub_category", sa.String(length=200), nullable=True),
        sa.Column("preferred_date", sa.Date(), nullable=False),
        sa.Column("preferred_slot", sa.String(length=30), nullable=True),
        sa.Column("intake_data", sa.Text(), nullable=True),
        sa.Column("status", sa.String(length=50), nullable=False, server_default="booked"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["clinic_id"], ["clinics.id"]),
        sa.ForeignKeyConstraint(["patient_id"], ["patients.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        "ix_procedure_booking_clinic_date",
        "procedure_bookings",
        ["clinic_id", "preferred_date"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index("ix_procedure_booking_clinic_date", table_name="procedure_bookings")
    op.drop_table("procedure_bookings")
