import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { ApiResponseData, ApiResponseError, KnoraApiConnection, LogoutResponse, ReadUser, UserResponse } from '@dasch-swiss/dsp-js';
import { DspApiConnectionToken, NotificationService, SessionService } from '@dasch-swiss/dsp-ui';
import { DialogComponent } from 'src/app/main/dialog/dialog.component';
import { CacheService } from '../../main/cache/cache.service';

@Component({
    selector: 'app-account',
    templateUrl: './account.component.html',
    styleUrls: ['./account.component.scss']
})
export class AccountComponent implements OnInit {

    loading: boolean;

    @Input() username: string;

    user: ReadUser;

    // in case of modification
    @Output() refreshParent: EventEmitter<any> = new EventEmitter<any>();

    constructor(
        @Inject(DspApiConnectionToken) private _dspApiConnection: KnoraApiConnection,
        private _cache: CacheService,
        private _dialog: MatDialog,
        private _notification: NotificationService,
        private _session: SessionService,
        private _titleService: Title) {
        // set the page title
        this._titleService.setTitle('Your account');
    }

    ngOnInit() {
        this.loading = true;

        // set the cache
        this._cache.get(this.username, this._dspApiConnection.admin.usersEndpoint.getUserByUsername(this.username));

        // get from cache
        this._cache.get(this.username, this._dspApiConnection.admin.usersEndpoint.getUserByUsername(this.username)).subscribe(
            (response: ApiResponseData<UserResponse>) => {
                this.user = response.body.user;
                this.loading = false;
            },
            (error: ApiResponseError) => {
                this._notification.openSnackBar(error);
                this.loading = false;
            }
        );
    }

    openDialog(mode: string, name: string, id?: string): void {
        const dialogConfig: MatDialogConfig = {
            width: '560px',
            position: {
                top: '112px'
            },
            data: { name: name, mode: mode }
        };

        const dialogRef = this._dialog.open(
            DialogComponent,
            dialogConfig
        );

        dialogRef.afterClosed().subscribe(response => {
            if (response === true) {
                // get the mode
                switch (mode) {
                    case 'deleteUser':
                        this.deleteUser(id);
                        break;

                    case 'activateUser':
                        this.activateUser(id);
                        break;
                }
            } else {
                // update the view
                this.refreshParent.emit();
            }
        });
    }

    deleteUser(id: string) {
        this._dspApiConnection.admin.usersEndpoint.deleteUser(id).subscribe(
            (response: ApiResponseData<UserResponse>) => {

                // console.log('refresh parent after delete', response);
                // this action will deactivate own user account. The consequence is a logout
                this._dspApiConnection.v2.auth.logout().subscribe(
                    (logoutResponse: ApiResponseData<LogoutResponse>) => {

                        // destroy cache
                        this._cache.destroy();

                        // destroy (dsp-ui) session
                        this._session.destroySession();

                        // reload the page
                        window.location.reload();
                    },
                    (error: ApiResponseError) => {
                        this._notification.openSnackBar(error);
                    }
                );
            },
            (error: ApiResponseError) => {
                this._notification.openSnackBar(error);
            }
        );

    }

    activateUser(id: string) {

        this._dspApiConnection.admin.usersEndpoint.updateUserStatus(id, true).subscribe(
            (response: ApiResponseData<UserResponse>) => {

                // console.log('refresh parent after activate', response);
                this.refreshParent.emit();
            },
            (error: ApiResponseError) => {
                this._notification.openSnackBar(error);
            }
        );
    }
}
