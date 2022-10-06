import { Injector } from '@angular/core';
import { ParagraphService } from './paragraph.service';
import { CheckPreviousElementsService } from './CheckPreviousElements.service';
import { ListService } from './list.service';
import { TableService } from './table.service'


export class AbstractClassComponent{
    protected paragraph_service:ParagraphService;
    protected checkPreviousElements_service:CheckPreviousElementsService;
    protected list_service:ListService;
    protected table_service:TableService

    constructor(injector:Injector){
        this.paragraph_service = injector.get(ParagraphService);
        this.checkPreviousElements_service = injector.get(CheckPreviousElementsService);
        this.list_service = injector.get(ListService);
        this.table_service = injector.get(TableService)
    }
}