import { Injectable } from "@angular/core";
import { Subject } from "rxjs";

@Injectable({
  providedIn: "root"
})
export class EditorService {
  private FileSource = new Subject<any>();
  FileData = this.FileSource.asObservable();

  sendToc(toc) {
    this.FileSource.next(toc);
  }

  constructor() {}
}
