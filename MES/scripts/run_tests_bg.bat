@echo off
echo Starting Frontend Regression Tests in the background...
start /B pytest tests/frontend_regression/test_catalog_ui.py > tests/regression_results.log 2>&1
echo Tests are running. View progress in tests/regression_results.log
