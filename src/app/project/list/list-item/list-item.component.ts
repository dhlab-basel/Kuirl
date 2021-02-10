import { Component, Inject, Input, OnInit } from '@angular/core';
import {
    ApiResponseData,
    ApiResponseError,
    KnoraApiConnection,
    ListNode,
    ListResponse
} from '@dasch-swiss/dsp-js';
import { DspApiConnectionToken } from '@dasch-swiss/dsp-ui';
import { ErrorHandlerService } from 'src/app/main/error/error-handler.service';
import { ListNodeOperation } from '../list-item-form/list-item-form.component';

@Component({
    selector: 'app-list-item',
    templateUrl: './list-item.component.html',
    styleUrls: ['./list-item.component.scss']
})
export class ListItemComponent implements OnInit {

    @Input() list: ListNode[];

    @Input() parentIri?: string;

    @Input() projectcode: string;

    @Input() projectIri: string;

    @Input() childNode: boolean;

    @Input() language?: string;

    expandedNode: string;

    constructor(
        @Inject(DspApiConnectionToken) private _dspApiConnection: KnoraApiConnection,
        private _errorHandler: ErrorHandlerService
    ) { }

    ngOnInit() {
        // in case of parent node: do not run the following request
        if (!this.childNode) {
            this._dspApiConnection.admin.listsEndpoint.getList(this.parentIri).subscribe(
                (result: ApiResponseData<ListResponse>) => {
                    this.list = result.body.list.children;
                    this.language = result.body.list.listinfo.labels[0].language;
                },
                (error: ApiResponseError) => {
                    this._errorHandler.showMessage(error);
                }
            );
        }
    }

    /**
     * Checks if parent node should show its children.
     * @param id id of parent node.
     */
    showChildren(id: string): boolean {
        return (id === this.expandedNode);
    }

    /**
     * Called from template when the 'expand' button is clicked.
     *
     * @param id id of parent node for which the 'expand' button was clicked.
     */
    toggleChildren(id: string) {

        if (this.showChildren(id)) {
            this.expandedNode = undefined;
        } else {
            this.expandedNode = id;
        }

    }

    /**
     * Called when the 'refreshParent' event from ListItemFormComponent is triggered.
     *
     * @param data info about the operation that was performed on the node and should be reflected in the UI.
     * @param firstNode states whether or not the node is a new child node; defaults to false.
     */
    updateView(data: ListNodeOperation, firstNode: boolean = false) {
        // update the view by updating the existing list
        if (data instanceof ListNodeOperation) {
            switch (data.operation) {
                case 'create': {
                    if (firstNode) {
                        // in case of new child node, we have to use the children from list
                        const index: number = this.list.findIndex(item => item.id === this.expandedNode);
                        this.list[index].children.push(data.listNode);

                    } else {
                        this.list.push(data.listNode);
                    }
                    break;
                }
                case 'update': {
                    this.list[data.listNode.position].labels = data.listNode.labels;
                    this.list[data.listNode.position].comments = data.listNode.comments;
                    break;
                }
                case 'delete': {
                    this.list = data.listNode.children;
                    break;
                }
                default: {
                    break;
                }
            }
        }
    }

}
