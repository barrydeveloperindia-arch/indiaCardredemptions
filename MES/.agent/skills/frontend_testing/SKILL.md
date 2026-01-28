
# Frontend UI Regression Tests

To run the frontend regression suite, ensure the MES frontend (`npm run dev`) and backend (`uvicorn`) are running.

Then execute:

```bash
pytest tests/frontend_regression/ --headed
```

Or for headless mode (CI/CD):

```bash
pytest tests/frontend_regression/
```
