import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { ApplicationRef, Component, ComponentFactoryResolver, Directive, Injector, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Params } from '@angular/router';
import { Session } from '@knora/authentication';
import { Project, ProjectsService, ApiServiceError, OntologyService } from '@knora/core';
import { ResourceTypeComponent } from './resource-type/resource-type.component';
import { CacheService } from 'src/app/main/cache/cache.service';

@Directive({
    selector: '[add-host]'
})
export class AddToDirective {
    constructor (public viewContainerRef: ViewContainerRef) { }
}

@Component({
    selector: 'app-ontology',
    templateUrl: './ontology.component.html',
    styleUrls: ['./ontology.component.scss']
})
export class OntologyComponent implements OnInit {

    // loading for progess indicator
    loading: boolean;

    // permissions of logged-in user
    session: Session;
    sysAdmin: boolean = false;
    projectAdmin: boolean = false;

    // project shortcode; as identifier in project cache service
    projectcode: string;

    // project data
    project: Project;

    // ontologies
    ontologies: any[];

    sourcetypes = ['Text', 'Image', 'Video'];

    @ViewChild('ontologyEditor', { read: ViewContainerRef }) ontologyEditor: ViewContainerRef;

    @ViewChild(AddToDirective) addToHost: AddToDirective;

    constructor (private _cache: CacheService,
        private _projectsService: ProjectsService,
        private _ontologyService: OntologyService,
        private _titleService: Title,
        private _route: ActivatedRoute,
        private _componentFactoryResolver: ComponentFactoryResolver,
        private _appRef: ApplicationRef,
        private _injector: Injector) {

        // get the shortcode of the current project
        this._route.parent.paramMap.subscribe((params: Params) => {
            this.projectcode = params.get('shortcode');
        });

        // set the page title
        this._titleService.setTitle('Project ' + this.projectcode + ' | Collaboration');
        this._titleService.setTitle('Ontology Editor');
    }

    ngOnInit() {
        this.loading = true;

        // get information about the logged-in user
        this.session = JSON.parse(localStorage.getItem('session'));
        // is the logged-in user system admin?
        this.sysAdmin = this.session.user.sysAdmin;

        // default value for projectAdmin
        this.projectAdmin = this.sysAdmin;

        // set the cache
        this._cache.get(this.projectcode, this._projectsService.getProjectByShortcode(this.projectcode));

        // get the project data from cache
        this._cache.get(this.projectcode, this._projectsService.getProjectByShortcode(this.projectcode)).subscribe(
            (result: Project) => {
                this.project = result;

                // is logged-in user projectAdmin?
                this.projectAdmin = this.sysAdmin
                    ? this.sysAdmin
                    : this.session.user.projectAdmin.some(e => e === this.project.id);

                // get from cache: list of project members and groups
                if (this.projectAdmin) {
                    // this.refresh();
                }

                // get the ontologies for this project
                this._ontologyService.getProjectOntologies(encodeURI(result.id)).subscribe(
                    (ontologies: any) => {
                        console.log(ontologies);
                    },
                    (error: ApiServiceError) => {
                        console.error(error);
                    }
                );

                this.loading = false;
            },
            (error: ApiServiceError) => {
                console.error(error);
                this.loading = false;
            }
        );
    }

    drop(event: CdkDragDrop<string[]>) {
        console.log(event);
    }

    addResourceType(id: string) {
        console.log(id);
        // this.ontologyEditor.nativeElement.insertAdjacentHTML('beforeend', ``);
        // this.appendComponentToBody(SelectListComponent);
    }

    loadComponent() {
        const componentFactory = this._componentFactoryResolver.resolveComponentFactory(ResourceTypeComponent);
        // this._componentFactoryResolver.resolveComponentFactory(ResourceTypeComponent);

        // const viewContainerRef = this.ontologyEditor.
        // viewContainerRef.clear();

        this.ontologyEditor.createComponent(componentFactory);
    }

    /**
 * refresh list of members after adding a new user to the team
 */
    refresh(): void {
        // referesh the component
        this.loading = true;

        // do something

        this.loading = false;

        // update the cache

        //        this._cache.del('members_of_' + this.projectcode);

        //        this.initList();

        // refresh child component: add user
        /*
                if (this.addUser) {
                    this.addUser.buildForm();
                }
                */
    }

}
