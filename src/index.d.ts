import { Notion } from "nagu-triples/dist/notions";

export interface IAnnotations {
  label: string|Notion<string>|undefined,
  comment: string|Notion<string>|undefined,
  seeAlso: string|Notion<string>|undefined,
  getAnnotations(): Promise<IAnnotations>,
  setAnnotations(annotations: {
    label: string|Notion<string>|undefined,
    comment: string|Notion<string>|undefined,
    seeAlso: string|Notion<string>|undefined,
  }): Promise<void>,
}