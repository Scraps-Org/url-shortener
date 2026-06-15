import fs from 'fs';

const envExample = fs.readFileSync('.env.example', 'utf8');

describe('env-example', () => {
  it('should contain UPSTASH_REDIS_REST_URL', () => {
    expect(envExample).toContain('UPSTASH_REDIS_REST_URL=');
  });

  it('should contain UPSTASH_REDIS_REST_TOKEN', () => {
    expect(envExample).toContain('UPSTASH_REDIS_REST_TOKEN=');
  });
});
