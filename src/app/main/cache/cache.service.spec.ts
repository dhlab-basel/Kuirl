import { TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CacheService } from './cache.service';

describe('CacheService', () => {
    beforeEach(() => TestBed.configureTestingModule({
        imports: [
            BrowserAnimationsModule,
            MatDialogModule,
            MatSnackBarModule
        ]
    }));

    it('should be created', () => {
        const service: CacheService = TestBed.inject(CacheService);
        expect(service).toBeTruthy();
    });

    // todo: get cache, set cache, delete cache, check if the key exists, destroy cache
});
