import {List} from "@chainsafe/ssz";
import {config} from "@chainsafe/lodestar-config/lib/presets/mainnet";
import {generateAttestationData} from "../../../utils/attestation";
import {expect} from "chai";
import {isValidIndexedAttestation} from "../../../../src/fast/block/isValidIndexedAttestation";
import {EpochContext} from "../../../../src/fast";
import {IndexedAttestation} from "@chainsafe/lodestar-types";
import {EMPTY_SIGNATURE} from "../../../../src";
import { generateState } from "../../../utils/state";
import { generateValidators } from "../../../utils/validator";

describe("validate indexed attestation", () => {
  // epochCtx is only used to access config in isValidIndexedAttestation
  const epochCtx = {config} as EpochContext;

  it("should return invalid indexed attestation - empty participants", () => {
    const attestationData = generateAttestationData(0, 1);
    const state = generateState({validators: generateValidators(100)});

    const indexedAttestation: IndexedAttestation = {
      attestingIndices: [] as number[] as List<number>,
      data: attestationData,
      signature: EMPTY_SIGNATURE,
    };
    expect(isValidIndexedAttestation(epochCtx, state, indexedAttestation, false)).to.be.false;
  });

  it("should return invalid indexed attestation - indexes not sorted", () => {
    const attestationData = generateAttestationData(0, 1);
    const state = generateState({validators: generateValidators(100)});

    const indexedAttestation: IndexedAttestation = {
      attestingIndices: [1, 0] as List<number>,
      data: attestationData,
      signature: EMPTY_SIGNATURE,
    };
    expect(isValidIndexedAttestation(epochCtx, state, indexedAttestation, false)).to.be.false;
  });

  it("should return valid indexed attestation", () => {
    const attestationData = generateAttestationData(0, 1);
    const state = generateState({validators: generateValidators(100)});

    const indexedAttestation: IndexedAttestation = {
      attestingIndices: [0, 1, 2, 3] as List<number>,
      data: attestationData,
      signature: EMPTY_SIGNATURE,
    };

    expect(isValidIndexedAttestation(epochCtx, state, indexedAttestation, false)).to.be.true;
  });


});
