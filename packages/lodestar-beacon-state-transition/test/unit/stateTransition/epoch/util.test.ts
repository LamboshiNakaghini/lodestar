import {expect} from "chai";
import sinon from "sinon";

import {config} from "@chainsafe/lodestar-config/lib/presets/mainnet";
import {
  getAttestingBalance,
  getMatchingHeadAttestations,
  getMatchingSourceAttestations,
  getMatchingTargetAttestations,
  getUnslashedAttestingIndices
} from "../../../../src/epoch/util";
import * as utils from "../../../../src/util";
import {FAR_FUTURE_EPOCH} from "../../../../src/constants";
import {generateEmptyAttestation} from "../../../utils/attestation";
import {getAttestingIndices} from "../../../../src/util";
import {generateValidator} from "../../../utils/validator";
import {generateState} from "../../../utils/state";

describe('process epoch - crosslinks', function () {

  const sandbox = sinon.createSandbox();

  let getActiveValidatorIndicesStub: any,
    getTotalBalanceStub: any,
    getBlockRootStub: any,
    getBlockRootAtSlotStub: any,
    getAttestingIndicesStub: any;

  beforeEach(() => {
    getActiveValidatorIndicesStub = sandbox.stub(utils, "getActiveValidatorIndices");
    getAttestingIndicesStub = sandbox.stub(utils, "getAttestingIndices");
    getTotalBalanceStub = sandbox.stub(utils, "getTotalBalance");
    getBlockRootStub = sandbox.stub(utils, "getBlockRoot");
    getBlockRootAtSlotStub = sandbox.stub(utils, "getBlockRootAtSlot");
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should get total active balance', function () {
    const validatorIndices = [1, 2];
    getActiveValidatorIndicesStub.returns(validatorIndices);
    try {
      utils.getTotalActiveBalance(config, generateState());
    } catch (e) {
      expect.fail(e.stack);
    }
  });

  it('should get matching source attestation - for current epoch', function () {
    const pendingAttestations = [
      {
        ...generateEmptyAttestation(),
        inclusionDelay: 10,
        proposerIndex: 1
      }
    ];
    const state = generateState({
      slot: config.params.SLOTS_PER_EPOCH,
      currentEpochAttestations: pendingAttestations
    });
    try {
      const result = getMatchingSourceAttestations(config, state, 1);
      expect(result).to.be.deep.equal(pendingAttestations);
    } catch (e) {
      expect.fail(e.stack);
    }

  });

  it('should get matching source attestation - for previous epoch', function () {
    const currentPendingAttestations = [
      {
        ...generateEmptyAttestation(),
        inclusionDelay: 10,
        proposerIndex: 1
      }
    ];
    const previousPendingAttestations = [
      {
        ...generateEmptyAttestation(),
        inclusionDelay: 10,
        proposerIndex: 2
      }
    ];
    const state = generateState({
      slot: config.params.SLOTS_PER_EPOCH,
      currentEpochAttestations: currentPendingAttestations,
      previousEpochAttestations: previousPendingAttestations
    });
    try {
      const result = getMatchingSourceAttestations(config, state, 0);
      expect(result).to.be.deep.equal(previousPendingAttestations);
    } catch (e) {
      expect.fail(e.stack);
    }

  });

  it('should get matching target attestation', function () {
    const blockRoot = Buffer.alloc(36, 2);
    const currentPendingAttestations = [
      {
        ...generateEmptyAttestation(),
        inclusionDelay: 10,
        proposerIndex: 1
      },
      {
        ...generateEmptyAttestation(),
        inclusionDelay: 10,
        proposerIndex: 1
      }
    ];
    currentPendingAttestations[0].data.target.root = blockRoot;
    const state = generateState({
      slot: config.params.SLOTS_PER_EPOCH,
      currentEpochAttestations: currentPendingAttestations
    });
    getBlockRootStub.returns(blockRoot);
    try {
      const result = getMatchingTargetAttestations(config, state, 1);
      expect(getBlockRootStub.calledOnce).to.be.true;
      expect(result).to.be.deep.equal([currentPendingAttestations[0]]);
    } catch (e) {
      expect.fail(e.stack);
    }

  });

  it('should get matching head attestation', function () {
    const blockRoot = Buffer.alloc(32, 2);
    const currentPendingAttestations = [
      {
        ...generateEmptyAttestation(),
        inclusionDelay: 10,
        proposerIndex: 1
      },
      {
        ...generateEmptyAttestation(),
        inclusionDelay: 10,
        proposerIndex: 1
      }
    ];
    currentPendingAttestations[0].data.beaconBlockRoot = blockRoot;
    const state = generateState({
      slot: config.params.SLOTS_PER_EPOCH,
      currentEpochAttestations: currentPendingAttestations
    });
    getBlockRootAtSlotStub.returns(blockRoot);
    getBlockRootStub.returns(Buffer.alloc(32));
    try {
      const result = getMatchingHeadAttestations(config, state, 1);
      expect(getBlockRootAtSlotStub.withArgs(config, sinon.match.any, 1).calledTwice).to.be.true;
      expect(result).to.be.deep.equal([currentPendingAttestations[0]]);
    } catch (e) {
      expect.fail(e.stack);
    }

  });

  it('should get unslashed attesting indices', function () {
    const pendingAttestations = [
      {
        ...generateEmptyAttestation(),
        inclusionDelay: 10,
        proposerIndex: 1
      },
      {
        ...generateEmptyAttestation(),
        inclusionDelay: 10,
        proposerIndex: 1
      }
    ];
    getAttestingIndicesStub.returns([0, 1]);
    const validator1 = generateValidator({activation: 0, exit: FAR_FUTURE_EPOCH, slashed: true});
    const validator2 = generateValidator({activation: 0, exit: FAR_FUTURE_EPOCH, slashed: false});
    const state = generateState({validators: [validator1, validator2]});
    try {
      const result = getUnslashedAttestingIndices(config, state, pendingAttestations);
      expect(result).to.be.deep.equal([1]);
      expect(getAttestingIndicesStub.calledTwice).to.be.true;
    } catch (e) {
      expect.fail(e.stack);
    }

  });

  it('should get attesting balance', function () {
    const pendingAttestations = [
      {
        ...generateEmptyAttestation(),
        inclusionDelay: 10,
        proposerIndex: 1
      },
      {
        ...generateEmptyAttestation(),
        inclusionDelay: 10,
        proposerIndex: 1
      }
    ];
    getAttestingIndicesStub.returns([0, 1]);
    const validator1 = generateValidator({activation: 0, exit: FAR_FUTURE_EPOCH, slashed: true});
    const validator2 = generateValidator({activation: 0, exit: FAR_FUTURE_EPOCH, slashed: false});
    const state = generateState({validators: [validator1, validator2]});
    getTotalBalanceStub.returns(1n);
    try {
      const result = getAttestingBalance(config, state, pendingAttestations);
      expect(result.toString()).to.be.deep.equal(1n.toString());
      expect(getTotalBalanceStub.withArgs(sinon.match.any, sinon.match.any, [1]).calledOnce).to.be.true;
    } catch (e) {
      expect.fail(e.stack);
    }

  });
});
