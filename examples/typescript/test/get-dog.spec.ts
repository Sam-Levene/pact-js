/* tslint:disable:no-unused-expression object-literal-sort-keys max-classes-per-file no-empty */
import * as chai from "chai"
import * as chaiAsPromised from "chai-as-promised"
import path = require("path")
import * as sinonChai from "sinon-chai"
import { Pact, Interaction } from "../../../src/pact"

const expect = chai.expect
import { DogService } from "../index"

chai.use(sinonChai)
chai.use(chaiAsPromised)

describe("The Dog API", () => {
  const url = "http://localhost"
  let dogService: DogService

  const provider = new Pact({
    // port,
    log: path.resolve(process.cwd(), "logs", "mockserver-integration.log"),
    dir: path.resolve(process.cwd(), "pacts"),
    spec: 2,
    consumer: "MyConsumer",
    provider: "MyProvider",
    pactfileWriteMode: "merge",
  })

  const EXPECTED_BODY = [{ dog: 1 }, { dog: 2 }]

  before(() =>
    provider.setup().then(opts => {
      dogService = new DogService({ url, port: opts.port })
    })
  )

  after(() => provider.finalize())

  afterEach(() => provider.verify())

  describe("get /dogs using builder pattern", () => {
    before(() => {
      const interaction = new Interaction()
        .given("I have a list of dogs")
        .uponReceiving("a request for all dogs")
        .withRequest({
          method: "GET",
          path: "/dogs",
          headers: {
            Accept: "application/json",
          },
        })
        .willRespondWith({
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
          body: EXPECTED_BODY,
        })

      return provider.addInteraction(interaction)
    })

    it("returns the correct response", done => {
      dogService.getMeDogs().then((response: any) => {
        expect(response.data).to.eql(EXPECTED_BODY)
        done()
      }, done)
    })
  })

  describe("get /dogs using object pattern", () => {
    before(() => {
      return provider.addInteraction({
        state: "i have a list of dogs",
        uponReceiving: "a request for all dogs",
        withRequest: {
          method: "GET",
          path: "/dogs",
          headers: {
            Accept: "application/json",
          },
        },
        willRespondWith: {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
          body: EXPECTED_BODY,
        },
      })
    })

    it("returns the correct response", done => {
      dogService.getMeDogs().then((response: any) => {
        expect(response.data).to.eql(EXPECTED_BODY)
        done()
      }, done)
    })
  })
})
