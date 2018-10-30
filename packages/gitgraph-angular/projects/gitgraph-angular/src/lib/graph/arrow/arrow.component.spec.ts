import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { ArrowComponent } from "./arrow.component";

describe("ArrowComponent", () => {
  let component: ArrowComponent;
  let fixture: ComponentFixture<ArrowComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ArrowComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ArrowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
