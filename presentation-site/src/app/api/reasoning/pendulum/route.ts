import { NextResponse } from "next/server";
import {
  DEFAULT_EXPERIMENT_LENGTHS,
  DEFAULT_EXPERIMENT_NOISE,
  fitPendulumParameters,
  generateReasoningStream,
  simulatePendulumTrials,
} from "@/lib/pendulum";

export function GET() {
  const trials = simulatePendulumTrials(DEFAULT_EXPERIMENT_LENGTHS, {
    noiseSigma: DEFAULT_EXPERIMENT_NOISE,
    seed: 17,
  });
  const fit = fitPendulumParameters(trials);
  const steps = generateReasoningStream(trials, fit, { noiseSigma: DEFAULT_EXPERIMENT_NOISE });

  return NextResponse.json({
    lengths: DEFAULT_EXPERIMENT_LENGTHS,
    noiseSigma: DEFAULT_EXPERIMENT_NOISE,
    fit,
    steps,
  });
}

