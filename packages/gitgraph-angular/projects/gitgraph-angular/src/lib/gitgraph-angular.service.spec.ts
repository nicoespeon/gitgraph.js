import { TestBed } from "@angular/core/testing";

import { GitgraphAngularService } from "./gitgraph-angular.service";

describe("GitgraphAngularService", () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it("should be created", () => {
    const service: GitgraphAngularService = TestBed.get(GitgraphAngularService);
    expect(service).toBeTruthy();
  });
});
