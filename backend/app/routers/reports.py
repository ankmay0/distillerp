from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date
from typing import List
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.production import Production
from app.models.sales import Sales
from app.models.expenses import Expense

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.get("/range")
def get_range_report(
    from_date: date = Query(...),
    to_date: date = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    productions = db.query(Production).filter(
        Production.date >= from_date,
        Production.date <= to_date
    ).order_by(Production.date).all()

    sales = db.query(Sales).filter(
        Sales.date >= from_date,
        Sales.date <= to_date
    ).order_by(Sales.date).all()

    expenses = db.query(Expense).filter(
        Expense.date >= from_date,
        Expense.date <= to_date
    ).order_by(Expense.date).all()

    # Build day by day report
    all_dates = set()
    for p in productions:
        all_dates.add(p.date)
    for s in sales:
        all_dates.add(s.date)
    for e in expenses:
        all_dates.add(e.date)

    sales_map = {s.date: s for s in sales}
    expense_map = {e.date: e for e in expenses}
    production_map = {p.date: p for p in productions}

    daily = []
    for d in sorted(all_dates):
        s = sales_map.get(d)
        e = expense_map.get(d)
        p = production_map.get(d)
        total_sales = s.total_sales if s else 0
        total_expenses = e.total if e else 0
        daily.append({
            "date": str(d),
            "batch": p.batch_number if p else None,
            "shift": p.shift if p else None,
            "total_sales": total_sales,
            "total_expenses": total_expenses,
            "net": total_sales - total_expenses,
            "is_profit": (total_sales - total_expenses) >= 0,
        })

    # Summary
    total_sales = sum(s.total_sales for s in sales)
    total_expenses = sum(e.total for e in expenses)
    total_open = sum(p.open_produced for p in productions)
    total_pkg = sum(p.pkg_produced for p in productions)

    # Expense breakdown
    expense_breakdown = {
        "salary": sum(e.salary for e in expenses),
        "diesel": sum(e.diesel for e in expenses),
        "petrol": sum(e.petrol for e in expenses),
        "meals": sum(e.meals for e in expenses),
        "others": sum(e.others for e in expenses),
    }

    return {
        "period": {
            "from": str(from_date),
            "to": str(to_date),
            "production_days": len(productions),
        },
        "summary": {
            "total_sales": total_sales,
            "total_expenses": total_expenses,
            "net_profit": total_sales - total_expenses,
            "is_profit": (total_sales - total_expenses) >= 0,
        },
        "production_summary": {
            "total_open_produced": total_open,
            "total_pkg_produced": total_pkg,
        },
        "expense_breakdown": expense_breakdown,
        "daily": daily,
    }

@router.get("/inventory/{entry_date}")
def get_inventory(
    entry_date: date,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    production = db.query(Production).filter(
        func.date(Production.date) == entry_date
    ).first()

    sales = db.query(Sales).filter(
        func.date(Sales.date) == entry_date
    ).first()

    if not production:
        return {"message": "No production entry for this date", "date": str(entry_date)}

    open_sold = 0
    pkg_sold = 0
    if sales:
        open_sold = sales.qty_o1 + sales.qty_o2 + sales.qty_o3
        pkg_sold = sales.qty_p1 + sales.qty_p2 + sales.qty_p3

    open_balance = production.open_produced + production.opening_stock - open_sold
    pkg_balance = production.pkg_produced - pkg_sold

    return {
        "date": str(entry_date),
        "open_liquor": {
            "produced": production.open_produced,
            "opening_stock": production.opening_stock,
            "sold": open_sold,
            "balance": open_balance,
        },
        "packaged": {
            "produced": production.pkg_produced,
            "sold": pkg_sold,
            "balance": pkg_balance,
        },
        "raw_materials": {
            "mahua": production.mahua,
            "sugar": production.sugar,
            "molasses": production.molasses,
        }
    }