import {config} from "@chainsafe/lodestar-config/lib/presets/minimal";
import {WinstonLogger} from "@chainsafe/lodestar-utils";
import sinon from "sinon";
import supertest from "supertest";
import {expect} from "chai";
import {StubbedNodeApi} from "../../../../utils/stub/nodeApi";
import {BeaconApi} from "../../../../../src/api/impl/beacon";
import {ApiNamespace} from "../../../../../src/api";
import {RestApi} from "../../../../../src/api/rest";
import {ValidatorApi} from "../../../../../src/api/impl/validator";
import {getVersion} from "../../../../../src/api/rest/controllers/node";

describe("rest - node - getVersion", function () {

  let api: RestApi;
  let nodeApiStub: StubbedNodeApi;

  beforeEach(async function () {
    nodeApiStub = new StubbedNodeApi();
    api = new RestApi({
      api: [ApiNamespace.NODE],
      cors: "*",
      enabled: true,
      host: "127.0.0.1",
      port: 0
    }, {
      config,
      logger: sinon.createStubInstance(WinstonLogger),
      validator: sinon.createStubInstance(ValidatorApi),
      beacon: sinon.createStubInstance(BeaconApi),
      node: nodeApiStub
    });
    await api.start();
  });

  afterEach(async function() {
    await api.stop();
  });

  it("should succeed", async function () {
    nodeApiStub.getVersion.resolves("test");
    const response = await supertest(api.server.server)
      .get(getVersion.url)
      .expect(200)
      .expect("Content-Type", "application/json; charset=utf-8");
    expect(response.body.data).to.not.be.undefined;
    expect(response.body.data).to.not.be.empty;
    expect(response.body.data.version).to.equal("test");
  });

});
