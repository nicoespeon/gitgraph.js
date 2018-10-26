import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { GitgraphAngularComponent } from "./gitgraph-angular.component";

describe("GitgraphAngularComponent", () => {
  let component: GitgraphAngularComponent;
  let fixture: ComponentFixture<GitgraphAngularComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [GitgraphAngularComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GitgraphAngularComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
