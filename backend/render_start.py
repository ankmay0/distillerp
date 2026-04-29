import os

from app.core.config import settings


def main():
    settings.validate_for_startup()
    print("DistillERP Render startup preflight passed", flush=True)
    print(f"Environment: {settings.ENVIRONMENT}", flush=True)
    print(f"Listening on PORT={os.getenv('PORT', '10000')}", flush=True)


if __name__ == "__main__":
    main()
