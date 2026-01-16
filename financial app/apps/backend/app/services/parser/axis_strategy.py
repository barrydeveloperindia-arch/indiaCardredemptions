import re
from typing import List, Dict, Any
from .base import StatementParserService

class AxisStatementParser(StatementParserService):
    """
    Parser for Axis Bank Statements.
    """
    @classmethod
    def supports(cls, raw_content: str) -> bool:
        return "Axis Bank" in raw_content or "AXIS BANK" in raw_content

    def parse(self) -> List[Dict[str, Any]]:
        transactions = []
        lines = self.raw_content.split('\n')
        
        # Regex: Date (DD-MM-YYYY) | Narration | ChqNo | Debit | Credit | Balance
        # Axis often uses DD-MM-YYYY
        date_pattern = re.compile(r"(\d{2}-\d{2}-\d{4})")
        
        for line in lines:
            line = line.strip()
            match = date_pattern.search(line)
            if not match:
                continue
                
            date_str = match.group(1)
            
            # Identify columns by splitting? Or Regex?
            # Axis is tricky, let's look for numbers at end
            # "01-01-2025 UPI/12345/Merchant   500.00 12000.00CR"
            # It usually has Debit, Credit, Balance columns
            
            # Simple heuristic: extract all numbers
            amounts = re.findall(r"([\d,]+\.\d{2})", line)
            
            if not amounts:
                continue
            
            # Assuming last number is Balance, 2nd last is Transaction Amount?
            # Or if 1 number, it's the transaction amount
            # Axis PDF usually: Debit | Credit | Balance
            # So if we see 2 numbers, one is 0.00? No, usually empty column.
            
            # Let's try to capture specific structure "Amount..."
            # For now, let's take the largest number that isn't the balance (usually balance is growing/shrinking)
            # OR simple approach: use the first number found after description
            
            # Let's grab the description first
            # Desc is between Date and first Amount
            parts = line.split(date_str)
            if len(parts) < 2: continue
            
            rest = parts[1]
            
            # Find first amount index
            amt_match = re.search(r"([\d,]+\.\d{2})", rest)
            if not amt_match: continue
            
            desc = rest[:amt_match.start()].strip()
            
            # Is it Debit or Credit?
            # Axis puts them in separate columns.
            # "500.00 0.00" -> Debit
            # "0.00 1000.00" -> Credit
            # This is hard to know without column position.
            # Heuristic: Check for "DR" or "CR" explicitly in line? Axis often uses trailing "Dr" or "Cr" for balance only.
            
            # Let's look at the amounts found in 'rest'
            found_amounts = re.findall(r"([\d,]+\.\d{2})", rest)
            # If 2 amounts: likely [TxnAmount, Balance]
            # If 3 amounts: likely [Debit, Credit, Balance]
            
            amount = 0.0
            type_flag = "DEBIT"
            
            if len(found_amounts) >= 1:
                # Assume the first one is the transaction amount for now
                try:
                    val = float(found_amounts[0].replace(",", ""))
                    amount = val
                except:
                    pass
            
            # Determine type by keywords in Description if columns ambiguous
            if "CREDIT" in line.upper() or "CR" in line.upper(): # Risky if "CR" is only for balance
                 pass
                 
            # Better Axis check:
            # If line has "DR" text near amount -> Debit
            
            # For MVP, default to DEBIT unless "CR" in desc or clearly Credit
            if "UPI" in desc and "CR" in line: # UPI Credit
                type_flag = "CREDIT"
            elif "DEPOSIT" in desc.upper():
                type_flag = "CREDIT"
            else:
                 type_flag = "DEBIT"
                 amount = -abs(amount)
                 
            if type_flag == "CREDIT":
                amount = abs(amount)

            transactions.append({
                "date": date_str,
                "description": desc,
                "amount": amount,
                "currency": "INR",
                "type": type_flag,
                "category": "UNCATEGORIZED",
                "metadata": {"bank": "Axis"}
            })
            
        return transactions
