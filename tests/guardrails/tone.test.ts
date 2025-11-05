import { checkToneGuardrail } from '@/lib/guardrails/tone';

describe('Tone Guardrails', () => {
  test('passes for empowering, supportive language', () => {
    const content = 'This is an opportunity to improve your financial health. ' +
                   'You might benefit from reviewing your budget. ' +
                   'Consider setting aside a small amount each month.';
    
    const result = checkToneGuardrail(content);

    expect(result.passed).toBe(true);
  });

  test('fails for shaming language', () => {
    const content = 'You are overspending and being irresponsible with money. ' +
                   'This is a bad financial decision.';
    
    const result = checkToneGuardrail(content);

    expect(result.passed).toBe(false);
    expect(result.reason).toContain('shaming language');
  });

  test('fails for overly prescriptive language', () => {
    const content = 'You must stop spending. You must save more. ' +
                   'You must change your habits. You must do this now.';
    
    const result = checkToneGuardrail(content);

    expect(result.passed).toBe(false);
    expect(result.reason).toContain('prescriptive');
  });

  test('fails when lacking empowering language', () => {
    const content = 'Pay your bills. Save money. Don\'t spend too much.';
    
    const result = checkToneGuardrail(content);

    expect(result.passed).toBe(false);
    expect(result.reason).toContain('empowering');
  });

  test('detects prohibited phrases case-insensitively', () => {
    const content = 'You have been OVERSPENDING on unnecessary items.';
    
    const result = checkToneGuardrail(content);

    expect(result.passed).toBe(false);
  });
});

