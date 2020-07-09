/**
 * Copyright 2020 Inrupt Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the
 * Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
 * PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import { describe, it, expect } from "@jest/globals";
import { DataFactory } from "n3";
import {
  isEqual,
  isNamedNode,
  isLiteral,
  isLocalNode,
  getLocalNode,
  asNamedNode,
  resolveIriForLocalNode,
  resolveLocalIri,
  resolveIriForLocalNodes,
  serializeBoolean,
  deserializeBoolean,
  serializeDatetime,
  deserializeDatetime,
  serializeDecimal,
  deserializeDecimal,
  serializeInteger,
  deserializeInteger,
  normalizeLocale,
} from "./datatypes";
import { LocalNode, makeIri } from "./interfaces";
import { INRUPT_TEST_IRI } from "./GENERATED/INRUPT_TEST_IRI";

describe("serializeBoolean", () => {
  it("serializes true as `1`", () => {
    expect(serializeBoolean(true)).toEqual("1");
  });

  it("serializes false as `0`", () => {
    expect(serializeBoolean(false)).toEqual("0");
  });
});
describe("deserializeBoolean", () => {
  it("parses `1` as true", () => {
    expect(deserializeBoolean("1")).toEqual(true);
  });

  it("parses `0` as false", () => {
    expect(deserializeBoolean("0")).toEqual(false);
  });

  it("returns null if a value is not a serialised boolean", () => {
    expect(deserializeBoolean("false")).toBeNull();
    expect(deserializeBoolean("Not a serialised boolean")).toBeNull();
  });
});

describe("serializeDatetime", () => {
  it("properly serialises a given datetime", () => {
    expect(
      serializeDatetime(new Date(Date.UTC(1990, 10, 12, 13, 37, 42, 0)))
    ).toEqual("1990-11-12T13:37:42Z");
  });
});
describe("deserializeDatetime", () => {
  it("properly parses a serialised datetime", () => {
    const expectedDate = new Date(Date.UTC(1990, 10, 12, 13, 37, 42, 0));
    expect(deserializeDatetime("1990-11-12T13:37:42Z")).toEqual(expectedDate);
  });

  it("returns null if a value is not a serialised datetime", () => {
    expect(deserializeDatetime("1990-11-12")).toBeNull();
    expect(deserializeDatetime("Not a serialised datetime")).toBeNull();
  });
});

describe("serializeDecimal", () => {
  it("properly serialises a given decimal", () => {
    expect(serializeDecimal(13.37)).toEqual("13.37");
  });
});
describe("deserializeDecimal", () => {
  it("properly parses a serialised decimal", () => {
    expect(deserializeDecimal("13.37")).toEqual(13.37);
  });

  it("return null if a value is not a serialised decimal", () => {
    expect(deserializeDecimal("Not a serialised decimal")).toBeNull();
  });
});

describe("serializeInteger", () => {
  it("properly serialises a given integer", () => {
    expect(serializeInteger(42)).toEqual("42");
  });
});
describe("deserializeInteger", () => {
  it("properly parses a serialised integer", () => {
    expect(deserializeInteger("42")).toEqual(42);
  });

  it("return null if a value is not a serialised integer", () => {
    expect(deserializeInteger("Not a serialised integer")).toBeNull();
  });
});

describe("normalizeLocale", () => {
  // The RDF/JS spec mandates lowercase locales:
  // https://rdf.js.org/data-model-spec/#dom-literal-language
  it("lowercases a given locale", () => {
    expect(normalizeLocale("EN-GB")).toEqual("en-gb");
    expect(normalizeLocale("nl-NL")).toEqual("nl-nl");
  });
});

describe("isNamedNode", () => {
  it("recognises a NamedNode", () => {
    expect(
      isNamedNode(DataFactory.namedNode("https://arbitrary.pod/resource#node"))
    ).toEqual(true);
  });

  it("recognises non-NamedNodes", () => {
    expect(isNamedNode(DataFactory.blankNode())).toEqual(false);
    expect(
      isNamedNode(Object.assign(DataFactory.blankNode(), { name: "localNode" }))
    ).toEqual(false);
    expect(isNamedNode(DataFactory.literal("Arbitrary value"))).toEqual(false);
    expect(isNamedNode(DataFactory.variable("Arbitrary name"))).toEqual(false);
    expect(isNamedNode("Arbitrary string")).toEqual(false);
  });
});

describe("isLiteral", () => {
  it("recognises a Literal", () => {
    expect(isLiteral(DataFactory.literal("Arbitrary value"))).toEqual(true);
  });

  it("recognises non-Literals", () => {
    expect(isLiteral(DataFactory.blankNode())).toEqual(false);
    expect(
      isLiteral(Object.assign(DataFactory.blankNode(), { name: "localNode" }))
    ).toEqual(false);
    expect(
      isLiteral(DataFactory.namedNode("https://arbitrary.pod/resource#node"))
    ).toEqual(false);
    expect(isLiteral(DataFactory.variable("Arbitrary name"))).toEqual(false);
    expect(isLiteral("Arbitrary string")).toEqual(false);
  });
});

describe("isLocalNode", () => {
  it("recognises a LocalNode", () => {
    expect(
      isLocalNode(Object.assign(DataFactory.blankNode(), { name: "localNode" }))
    ).toEqual(true);
  });

  it("recognises non-LocalNodes", () => {
    expect(isLocalNode(DataFactory.blankNode())).toEqual(false);
    expect(
      isLocalNode(DataFactory.namedNode("https://arbitrary.pod/resource#node"))
    ).toEqual(false);
    expect(isLocalNode(DataFactory.literal("Arbitrary value"))).toEqual(false);
    expect(isLocalNode(DataFactory.variable("Arbitrary name"))).toEqual(false);
    expect(isLocalNode("Arbitrary string")).toEqual(false);
  });
});

describe("getLocalNode", () => {
  it("constructs a proper LocalNode", () => {
    const localNode = getLocalNode("some-name");
    expect(localNode.termType).toEqual("BlankNode");
    expect(localNode.name).toEqual("some-name");
  });
});

describe("asNamedNode", () => {
  it("constructs a proper NamedNode from an IRI", () => {
    const namedNode = asNamedNode("https://some.pod/resource#node");
    expect(namedNode.termType).toEqual("NamedNode");
    expect(namedNode.value).toEqual("https://some.pod/resource#node");
  });

  it("preserves an existing NamedNode", () => {
    const originalNode = DataFactory.namedNode(
      "https://some.pod/resource#node"
    );
    const newNode = asNamedNode(originalNode);
    expect(newNode).toEqual(originalNode);
  });

  it("throws an error on invalid IRIs", () => {
    expect(() => asNamedNode("Not an IRI")).toThrow("Not an IRI");
  });
});

describe("isEqual", () => {
  it("recognises two equal LocalNodes without needing a Resource IRI", () => {
    const localNode1: LocalNode = Object.assign(DataFactory.blankNode(), {
      name: "some-name",
    });
    const localNode2: LocalNode = Object.assign(DataFactory.blankNode(), {
      name: "some-name",
    });
    expect(isEqual(localNode1, localNode2)).toEqual(true);
  });

  it("recognises two equal NamedNodes without needing a Resource IRI", () => {
    const namedNode1 = DataFactory.namedNode("https://some.pod/resource#node");
    const namedNode2 = DataFactory.namedNode("https://some.pod/resource#node");
    expect(isEqual(namedNode1, namedNode2)).toEqual(true);
  });

  it("recognises the equality of a LocalNode with the same resource IRI to a NamedNode", () => {
    const localNode: LocalNode = Object.assign(DataFactory.blankNode(), {
      name: INRUPT_TEST_IRI.hashSomeSubject,
    });

    // We need the subject of our quad to be a hash-something IRI relative to
    // our resource.
    const namedNode = INRUPT_TEST_IRI.somePodResourceHashSomeSubject;

    expect(
      isEqual(localNode, namedNode, {
        resourceIri: INRUPT_TEST_IRI.somePodResource,
      })
    ).toEqual(true);
    expect(
      isEqual(namedNode, localNode, {
        resourceIri: INRUPT_TEST_IRI.somePodResource,
      })
    ).toEqual(true);
  });

  it("recognises the inequality of a LocalNode with a different resource IRI to a NamedNode", () => {
    const localNode: LocalNode = Object.assign(DataFactory.blankNode(), {
      name: "some-name",
    });
    const namedNode = DataFactory.namedNode(
      "https://some.pod/resource#some-name"
    );
    expect(
      isEqual(localNode, namedNode, {
        resourceIri: INRUPT_TEST_IRI.someOtherPodResource,
      })
    ).toEqual(false);
    expect(
      isEqual(namedNode, localNode, {
        resourceIri: INRUPT_TEST_IRI.someOtherPodResource,
      })
    ).toEqual(false);
  });

  it("does not mark a LocalNode as equal to a NamedNode if no resource IRI is known", () => {
    const localNode: LocalNode = Object.assign(DataFactory.blankNode(), {
      name: "some-name",
    });
    const namedNode = DataFactory.namedNode(
      "https://some.pod/resource#some-name"
    );
    expect(isEqual(localNode, namedNode)).toEqual(false);
    expect(isEqual(namedNode, localNode)).toEqual(false);
  });
});

describe("resolveIriForLocalNodes", () => {
  it("properly resolves the IRI for the Subject and the Object", () => {
    const localNodeSubject: LocalNode = Object.assign(DataFactory.blankNode(), {
      name: INRUPT_TEST_IRI.hashSomeSubject,
    });
    const localNodeObject: LocalNode = Object.assign(DataFactory.blankNode(), {
      name: INRUPT_TEST_IRI.hashSomeObject,
    });
    const quad = DataFactory.quad(
      localNodeSubject,
      INRUPT_TEST_IRI.arbitraryPredicate,
      localNodeObject
    );
    const resolvedQuad = resolveIriForLocalNodes(
      quad,
      INRUPT_TEST_IRI.somePodResource
    );
    expect(resolvedQuad.subject).toEqual(
      INRUPT_TEST_IRI.somePodResourceHashSomeSubject
    );
    expect(resolvedQuad.object).toEqual(
      INRUPT_TEST_IRI.somePodResourceHashSomeObject
    );
  });

  it("does not resolve the IRI for NamedNodes", () => {
    const quad = DataFactory.quad(
      DataFactory.namedNode("https://some.pod/resource#some-subject"),
      INRUPT_TEST_IRI.arbitraryPredicate,
      DataFactory.namedNode("https://some.pod/resource#some-object")
    );
    const resolvedQuad = resolveIriForLocalNodes(
      quad,
      INRUPT_TEST_IRI.somePodResource
    );
    expect(resolvedQuad.subject.value).toEqual(
      "https://some.pod/resource#some-subject"
    );
    expect(resolvedQuad.object.value).toEqual(
      "https://some.pod/resource#some-object"
    );
  });
});

describe("resolveIriForLocalNode", () => {
  it("properly resolves the IRI for a LocalNode", () => {
    const localNode: LocalNode = Object.assign(DataFactory.blankNode(), {
      name: INRUPT_TEST_IRI.hashSomeSubject,
    });
    expect(
      resolveIriForLocalNode(localNode, INRUPT_TEST_IRI.somePodResource)
    ).toEqual(INRUPT_TEST_IRI.somePodResourceHashSomeSubject);
  });
});

describe("resolveLocalIri", () => {
  it("properly resolves the IRI for a given name and resource IRI", () => {
    expect(
      resolveLocalIri(
        INRUPT_TEST_IRI.hashSomeSubject,
        INRUPT_TEST_IRI.somePodResource
      )
    ).toEqual(INRUPT_TEST_IRI.somePodResourceHashSomeSubject);
  });
});
