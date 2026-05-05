import { CsvChartRepository } from './chart.repository';

describe('CsvChartRepository', () => {
  let repo: CsvChartRepository;

  beforeEach(() => {
    repo = new CsvChartRepository();
  });

  it('should return 16 rows with correct first row when female height is requested', () => {
    const data = repo.findAll('female', 'height');

    expect(data).toHaveLength(16);
    expect(data[0]).toEqual({
      age: 3,
      c3: 90.0,
      c10: 92.0,
      c25: 94.0,
      c50: 96,
      c75: 98.0,
      c90: 100.0,
      c97: 102.0,
    });
  });

  it('should return 16 rows with correct first row when male height is requested', () => {
    const data = repo.findAll('male', 'height');

    expect(data).toHaveLength(16);
    expect(data[0]).toEqual({
      age: 3,
      c3: 91.0,
      c10: 93.0,
      c25: 95.5,
      c50: 98,
      c75: 100.5,
      c90: 103.0,
      c97: 105.0,
    });
  });

  it('should strip unit suffix from column names when parsing weight CSV', () => {
    const data = repo.findAll('female', 'weight');

    expect(data[0]).toEqual({
      age: 3,
      c3: 11.5,
      c10: 12.5,
      c25: 13.5,
      c50: 14.5,
      c75: 15.5,
      c90: 16.5,
      c97: 18.0,
    });
  });

  it('should return 16 rows with correct first row when male weight is requested', () => {
    const data = repo.findAll('male', 'weight');

    expect(data).toHaveLength(16);
    expect(data[0]).toEqual({
      age: 3,
      c3: 11.5,
      c10: 12.5,
      c25: 13.5,
      c50: 14.5,
      c75: 15.5,
      c90: 16.5,
      c97: 18.0,
    });
  });
});
