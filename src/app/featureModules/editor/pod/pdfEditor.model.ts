export interface pdfEditorModel{
    startFromUniqID:any,
    elemType:any,
    DOMelement:any,
    paraStartFrom:any,
    LIstartValue:any,
    table:{
        firstThreeRows:boolean,
        lastThreeRows:boolean,
        inBetween:boolean,
        removeTill:any,
        objStartFrom:any
    },
    siblingCounts:any,
    isSibling:boolean,
    breakCondition:boolean,
}
