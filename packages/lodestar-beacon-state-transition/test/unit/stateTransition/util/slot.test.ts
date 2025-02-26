import {assert} from "chai";

import {config} from "@chainsafe/lodestar-config/lib/presets/mainnet";import { computeSlotsSinceEpochStart } from "../../../../src/util";
import {Slot} from "@chainsafe/lodestar-types";


describe("computeSlotsSinceEpochStart", () => {
  const pairs = [
    {test: 0, expected: 0},
    {test: 5, expected: 5},
    {test: 40, expected: 8},
    {test: 50, expected: 18},
  ];

  for (const pair of pairs) {
    it(`Slot ${pair.test} is ${pair.expected} from current Epoch start`, () => {
      const result: Slot = computeSlotsSinceEpochStart(config, pair.test);
      assert.equal(result, pair.expected);
    });
  }

  it("should compute slot correctly since a specified epoch", () => {
    const epoch = 1;
    const slot = 70;
    const result = computeSlotsSinceEpochStart(config, slot, epoch);
    // 70 - NUM_SLOT_PER_EPOCH
    assert.equal(result, 38);
  });
});