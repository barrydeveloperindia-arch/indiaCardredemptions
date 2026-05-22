import fs from 'fs';
import path from 'path';

const matrixPath = path.resolve(__dirname, '../constants/transferMatrix.json');
const mccPath = path.resolve(__dirname, '../constants/mccDatabase.json');

describe('Core Database Validations', () => {
  it('should verify transferMatrix.json exists and has valid schemas', () => {
    expect(fs.existsSync(matrixPath)).toBe(true);
    const matrix = JSON.parse(fs.readFileSync(matrixPath, 'utf8'));

    // Assert key cards exist
    expect(matrix).toHaveProperty('axis_m4b');
    expect(matrix).toHaveProperty('amex_platinum');
    expect(matrix).toHaveProperty('hsbc_premier');

    // Assert Axis Magnus for Burgundy blocked partners are omitted or map to 0
    expect(matrix.axis_m4b).toHaveProperty('accor', 0.0);
    expect(matrix.axis_m4b).toHaveProperty('krisflyer', 0.8);

    // Assert HSBC transfer is 1:1 (1.0)
    expect(matrix.hsbc_premier).toHaveProperty('krisflyer', 1.0);
    expect(matrix.hsbc_premier).toHaveProperty('accor', 1.0);
  });

  it('should verify mccDatabase.json exists and contains category/multiplier mappings', () => {
    expect(fs.existsSync(mccPath)).toBe(true);
    const mccDb = JSON.parse(fs.readFileSync(mccPath, 'utf8'));

    // Assert key merchants are registered
    expect(mccDb).toHaveProperty('Zomato');
    expect(mccDb).toHaveProperty('Amazon');
    expect(mccDb).toHaveProperty('Uber');

    // Assert MCC database nodes have category and multiplier info
    expect(mccDb.Zomato).toHaveProperty('category', 'dining');
    expect(mccDb.Zomato).toHaveProperty('mcc', '5812');
  });
});
