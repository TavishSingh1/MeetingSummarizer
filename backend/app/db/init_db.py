from app.db.base import Base
from app.db.session import engine
from app.models.meeting import Meeting


def init_db() -> None:
    Base.metadata.create_all(bind=engine)


if __name__ == "__main__":
    init_db()
