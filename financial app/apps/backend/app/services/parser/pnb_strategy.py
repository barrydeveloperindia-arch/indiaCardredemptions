import re
from typing import List, Dict, Any
from .base import StatementParserService

class PnbStatementParser(StatementParserService):
    """
    Parser for Punjab National Bank (PNB) Statements.
    """
    @classmethod
    def supports(cls, raw_content: str) -> bool:
        return "Punjab National Bank" in raw_content or "PNB" in raw_content

    def parse(self) -> List[Dict[str, Any]]:
        transactions = []
        lines = self.raw_content.split('\n')
        
        # PNB usually: DD/MM/YYYY
        date_pattern = re.compile(r"(\d{2}/\d{2}/\d{4})")
        
        for line in lines:
            line = line.strip()
            match = date_pattern.search(line)
            if not match:
                continue
                
            date_str = match.group(1)
            
            # PNB structure is often messy in PDF text extract
            # Date ChequeNo Desc Withdraw Deposit Balance
            
            # Find amounts
            amounts = re.findall(r"([\d,]+\.\d{2})", line)
            
            if not amounts:
                continue
                
            # Heuristic: If multiple amounts, last is likely balance. 
            # If 2 amounts: [Txn, Balance]
            
            txn_amount = 0.0
            type_flag = "DEBIT"
            
            try:
                val = float(amounts[0].replace(",", ""))
                txn_amount = val
            except:
                continue
                
            # If there are 3 numbers: [Debit, Credit, Balance]
            # If we see 0.00 in first slot -> Credit?
            
            # Let's rely on keywords for PNB as formatting is unstable
            desc = line.split(date_str)[1]
            # Remove amounts from desc
            for amt in amounts:
                desc = desc.replace(amt, "")
            
            desc = desc.strip()
            
            is_credit = "BY TFR" in desc or "NEFT CR" in desc or "UPI CR" in desc or "DEPOSIT" in desc
            
            if is_credit:
                type_flag = "CREDIT"
                txn_amount = abs(txn_amount)
            else:
                type_flag = "DEBIT"
                txn_amount = -abs(txn_amount)

            transactions.append({
                "date": date_str,
                "description": desc,
                "amount": txn_amount,
                "currency": "INR",
                "type": type_flag,
                "category": "UNCATEGORIZED",
                "metadata": {"bank": "PNB"}
            })
            
        return transactions
