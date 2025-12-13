import { Component, DestroyRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { CommonModule, DatePipe } from '@angular/common';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { RatingModule } from 'primeng/rating';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { RadioButtonModule } from 'primeng/radiobutton';
import { InputNumberModule } from 'primeng/inputnumber';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { Product, ProductService } from '../service/product.service';
import { HttpClient } from '@angular/common/http';
import { IGeneralResponse } from '@/pages/auth/login';
import {
  catchError,
  delay,
  distinctUntilChanged,
  finalize,
  map,
  switchMap,
  tap,
} from 'rxjs/operators';
import { debounceTime, of } from 'rxjs';
import { Skeleton } from 'primeng/skeleton';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ProgressBar } from 'primeng/progressbar';
import { DatePickerModule } from 'primeng/datepicker';
import { MultiSelectModule } from 'primeng/multiselect';
import { ProgressSpinner } from 'primeng/progressspinner';
import { BlockUI } from 'primeng/blockui';

interface Column {
  field: string;
  header: string;
  customExportHeader?: string;
}

interface ExportColumn {
  title: string;
  dataKey: string;
}

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    FormsModule,
    ButtonModule,
    RippleModule,
    ToastModule,
    ToolbarModule,
    RatingModule,
    InputTextModule,
    TextareaModule,
    SelectModule,
    RadioButtonModule,
    InputNumberModule,
    DialogModule,
    TagModule,
    InputIconModule,
    IconFieldModule,
    ConfirmDialogModule,
    Skeleton,
    ProgressBar,
    DatePickerModule,
    MultiSelectModule,
    ProgressSpinner,
    ReactiveFormsModule,
    BlockUI,
  ],
  template: `
    <p-blockUI [blocked]="globalLoading()">
      <div style="display: grid; height: 100%; width: 100%; place-items: center">
        <p-progressSpinner></p-progressSpinner>
      </div>
    </p-blockUI>

    <p-toolbar styleClass="mb-6">
      <ng-template #start>
        <p-button
          label="New"
          icon="pi pi-plus"
          severity="secondary"
          class="mr-2"
          (onClick)="openNew()"
        />
        <p-button
          severity="secondary"
          label="Delete"
          icon="pi pi-trash"
          outlined
          (onClick)="deleteSelectedProducts()"
          [disabled]="!selectedProducts || !selectedProducts.length"
        />
      </ng-template>

      <ng-template #end>
        <p-button
          label="Export"
          icon="pi pi-upload"
          severity="secondary"
          (onClick)="exportCSV()"
        />
      </ng-template>
    </p-toolbar>

    @if (loading()) {
      <p-skeleton
        width="100%"
        height="calc(100vh - 250px)"
        borderRadius="8px"
      ></p-skeleton>
    } @else {
      <p-table
        #dt
        [value]="events()"
        [rows]="10"
        [columns]="cols"
        [paginator]="true"
        [tableStyle]="{ 'min-width': '75rem' }"
        [(selection)]="selectedProducts"
        [rowHover]="true"
      >
        <ng-template #caption>
          <div class="flex items-center justify-between">
            <h5 class="m-0">Events management</h5>
            <p-iconfield>
              <p-inputicon styleClass="pi pi-search" />
              <input
                pInputText
                type="text"
                (input)="onGlobalFilter($event)"
                placeholder="Search..."
              />
              @if (searchLoading()) {
                <p-inputicon class="pi pi-spin pi-spinner" />
              }
            </p-iconfield>
          </div>
        </ng-template>
        <ng-template #header>
          <tr>
            <th style="width: 3rem">
              <p-tableHeaderCheckbox />
            </th>
            <th style="min-width: 16rem">Event</th>
            <th style="min-width:16rem">Club</th>
            <th>Data & Time</th>
            <th style="min-width: 8rem">Attendees</th>
            <th style="min-width:10rem">Status</th>
            <th style="min-width:10rem">Price</th>
            <th style="min-width: 12rem"></th>
          </tr>
        </ng-template>
        <ng-template
          #body
          let-event
        >
          <tr>
            <td style="width: 3rem">
              <p-tableCheckbox [value]="event" />
            </td>
            <td style="min-width: 12rem">{{ event.event_name }}</td>
            <td style="min-width: 15rem">{{ event.club_name }}</td>
            <td>
              <div style="display: flex; flex-direction: column; gap: 2px">
                <div style="display: flex; gap: 12px">
                  <i class="pi pi-calendar"></i>
                  {{ event.event_datetime | date }}
                </div>
                <div style="display: flex; gap: 12px; color: gray">
                  <i class="pi pi-clock"></i>
                  {{ event.event_datetime | date: 'HH:mm' }}
                </div>
              </div>
            </td>
            <td>
              <div style="display: flex; flex-direction: column; gap: 5px; text-align: center;">
                {{ event.registered_count }} / {{ event.max_participants }}
                <div>
                  <p-progressbar
                    [value]="
                      event.registered_count
                        ? ((event.registered_count / event.max_participants) * 100).toFixed(1)
                        : 0
                    "
                  >
                    <ng-template
                      #content
                      let-value
                    >
                    </ng-template>
                  </p-progressbar>
                </div>
              </div>
            </td>
            <td>
              <p-tag
                [value]="event.event_status"
                [severity]="eventStatusSaverity[event.event_status]"
              ></p-tag>
            </td>
            <td>{{ event.ticket_price }} {{ event.currency }}</td>
            <td>
              <p-button
                [disabled]="event.event_status !== 'scheduled'"
                icon="pi pi-pencil"
                class="mr-2"
                [rounded]="true"
                [outlined]="true"
                (click)="editProduct(event)"
              />

              <p-button
                icon="pi pi-trash"
                severity="danger"
                [rounded]="true"
                [outlined]="true"
                (click)="deleteProduct(event)"
              />
            </td>
          </tr>
        </ng-template>
      </p-table>
    }

    <p-dialog
      [(visible)]="productDialog"
      [style]="{ width: '450px' }"
      [header]="headerDialog()"
      [modal]="true"
    >
      <ng-template #content>
        <div
          [formGroup]="form"
          style="height: calc(100vh - 420px)"
          class="flex flex-col gap-6"
        >
          <div>
            <label
              for="name"
              class="block font-bold mb-3"
              >Event name</label
            >
            <input
              [formControl]="form.controls.eventName"
              type="text"
              pInputText
              id="name"
              required
              autofocus
              fluid
            />
            <small
              class="text-red-500"
              *ngIf="submitted && !form.value.eventName"
              >Event name is required.</small
            >
          </div>
          <div>
            <label
              for="club"
              class="block font-bold mb-3"
              >Club name</label
            >
            <p-select
              [formControl]="form.controls.clubName"
              inputId="club"
              [options]="clubs()"
              optionLabel="name"
              optionValue="id"
              placeholder="Select a club"
              fluid
            />

            <small
              class="text-red-500"
              *ngIf="submitted && !form.value.clubName"
              >Club name is required.</small
            >
          </div>
          <div style="display: flex; gap: 5px">
            <div class="flex-auto">
              <label
                for="buttondisplay"
                class="font-bold block mb-2"
              >
                Date
              </label>
              <p-datepicker
                dateFormat="dd.mm.yy"
                [formControl]="form.controls.date"
                [showIcon]="true"
                inputId="buttondisplay"
                [showOnFocus]="false"
              />
            </div>

            <div class="flex-auto">
              <label
                for="templatedisplay"
                class="font-bold block mb-2"
              >
                Time
              </label>
              <p-datepicker
                [formControl]="form.controls.time"
                [iconDisplay]="'input'"
                [showIcon]="true"
                [timeOnly]="true"
                inputId="templatedisplay"
              >
                <ng-template
                  #inputicon
                  let-clickCallBack="clickCallBack"
                >
                  <i
                    class="pi pi-clock"
                    (click)="clickCallBack($event)"
                  ></i>
                </ng-template>
              </p-datepicker>
            </div>
          </div>
          <div>
            <label
              for="quantity"
              class="block font-bold mb-3"
              >Quantity</label
            >
            <p-inputnumber
              [formControl]="form.controls.quantity"
              id="quantity"
              fluid
            ></p-inputnumber>
          </div>
          <div>
            <label
              for="inventoryStatus"
              class="block font-bold mb-3"
              >Status</label
            >
            <p-select
              [formControl]="form.controls.status"
              inputId="inventoryStatus"
              [options]="statuses"
              optionLabel="label"
              optionValue="label"
              placeholder="Select a Status"
              fluid
            />
          </div>

          <div class="grid grid-cols-12 gap-4">
            <div class="col-span-6">
              <label
                for="price"
                class="block font-bold mb-3"
                >Price</label
              >
              <p-inputnumber
                [formControl]="form.controls.price"
                id="price"
                mode="currency"
                [currency]="'USD'"
                locale="en-US"
                fluid
              />
            </div>
            <div class="col-span-6">
              <label
                for="currency"
                class="block font-bold mb-3"
                >Currency</label
              >
              <input
                pInputText
                [formControl]="form.controls.cureency"
                id="currency"
                fluid
              />
            </div>
          </div>
        </div>
      </ng-template>

      <ng-template #footer>
        <p-button
          label="Cancel"
          icon="pi pi-times"
          text
          (click)="hideDialog()"
        />
        <p-button
          [disabled]="form.invalid"
          label="Save"
          icon="pi pi-check"
          (click)="saveProduct()"
        />
      </ng-template>
    </p-dialog>

    <p-confirmdialog [style]="{ width: '450px' }"></p-confirmdialog>
  `,
  providers: [MessageService, ProductService, ConfirmationService, DatePipe],
})
export class Events implements OnInit {
  productDialog: boolean = false;

  products = signal<Product[]>([]);
  headerDialog = signal('');

  product!: Product;

  selectedProducts!: EventReport[] | null;

  submitted: boolean = false;

  statuses: any = [
    { label: 'scheduled', value: 'scheduled' },
    { label: 'cancelled', value: 'cancelled' },
    { label: 'completed', value: 'completed' },
    { label: 'ongoing', value: 'ongoing' },
  ];

  @ViewChild('dt') dt!: Table;

  exportColumns!: ExportColumn[];

  cols = [
    {
      field: 'user_full_name',
      header: 'Member',
      customExportHeader: 'Full Name',
    },
    {
      field: 'user_email',
      header: 'Contact',
    },
    {
      field: 'club_name',
      header: 'Club',
    },
    {
      field: 'user_role',
      header: 'Role',
    },
    {
      field: 'user_status',
      header: 'Status',
    },
    {
      field: 'events_registered_count',
      header: 'Events',
    },
    {
      field: 'events_registered_count',
      header: 'Events',
    },
  ];
  clubs = signal<Partial<Club>[]>([]);

  loading = signal(true);
  searchLoading = signal(false);
  private destroyRef = inject(DestroyRef);

  events = signal<EventReport[]>([]);
  searchValue = new FormControl<string>('', { nonNullable: true });
  globalLoading = signal<boolean>(false);
  userRoleSaverity: any = {
    member: 'info',
    admin: 'danger',
    club_owner: 'warn',
  };
  eventStatusSaverity: any = {
    scheduled: 'warn',
    ongoing: 'info',
    completed: 'success',
    cancelled: 'danger',
  };

  form: CreateEventFormType = new FormGroup({
    id: new FormControl<string | null>(null),
    eventName: new FormControl<string | null>(null, Validators.required),
    clubName: new FormControl<string | null>(null, Validators.required),
    date: new FormControl<string | null>(null, Validators.required),
    time: new FormControl<string | null>(null, Validators.required),
    quantity: new FormControl<string | null>(null, Validators.required),
    status: new FormControl<string | null>(null, Validators.required),
    price: new FormControl<string | null>(null),
    cureency: new FormControl<string | null>(null),
  });

  private httpClient = inject(HttpClient);

  constructor(
    private productService: ProductService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
  ) {
    this.form.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((res) => {
      console.log(res);
    });
    this.searchValue.valueChanges
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        distinctUntilChanged(),
        debounceTime(400),
        switchMap((value) => {
          this.searchLoading.set(true);
          return this.httpClient
            .get<
              IGeneralResponse<{
                events: EventReport[];
              }>
            >(`http://localhost:8000/server/api/events/search?query=${value}`)
            .pipe(
              delay(500),
              map(({ data }) => {
                if (!data) return <EventReport[]>[];
                return data.events;
              }),
              catchError(() => of(<EventReport[]>[])),
              finalize(() => this.searchLoading.set(false)),
            );
        }),
      )
      .subscribe((resp) => this.events.set(resp));
  }

  exportCSV() {
    this.dt.exportCSV();
  }

  ngOnInit() {
    this.loadDemoData();
    this.getEvents();
  }

  createEvent() {
    const form = this.form.value;
    this.globalLoading.set(true);
    return this.httpClient
      .post('http://localhost:8000/server/api/events', {
        title: form.eventName,
        club_id: form.clubName,
        event_date: `${this.datePipe.transform(form.date, 'yyyy-MM-dd')} ${this.datePipe.transform(form.date, 'hh:mm:ss')}`,
        max_participants: form.quantity,
        event_status: form.status,
        ticket_price: form.price,
        currency: form.cureency,
      })
      .pipe(
        delay(500),
        catchError(() => of(null)),
        tap(() => this.getEvents()),
        finalize(() => this.globalLoading.set(false)),
      );
  }

  editEvent() {
    const form = this.form.value;
    this.globalLoading.set(true);
    return this.httpClient
      .patch(`http://localhost:8000/server/api/events/${form.id}`, {
        title: form.eventName,
        club_id: form.clubName,
        event_date: `${this.datePipe.transform(form.date, 'yyyy-MM-dd')} ${this.datePipe.transform(form.date, 'hh:mm:ss')}`,
        max_participants: form.quantity,
        event_status: form.status,
        ticket_price: form.price,
        currency: form.cureency,
      })
      .pipe(
        delay(500),
        catchError(() => of(null)),
        tap(() => this.getEvents()),
        finalize(() => this.globalLoading.set(false)),
      );
  }

  getEvents() {
    this.loading.set(true);
    this.httpClient
      .get<IGeneralResponse<EventReport[]>>('http://localhost:8000/server/api/events/report')
      .pipe(
        delay(500),
        map(({ data }) => {
          if (!data) return <EventReport[]>[];
          return data.reverse();
        }),
        catchError(() => of(<EventReport[]>[])),
        finalize(() => this.loading.set(false)),
      )
      .subscribe((resp) => this.events.set(resp));
  }

  getClubs() {
    this.globalLoading.set(true);
    return this.httpClient
      .get<IGeneralResponse<{ clubs: Club[] }>>('http://localhost:8000/server/api/clubs')
      .pipe(
        delay(500),
        map(({ data }) => {
          if (!data) return <Club[]>[];
          return data.clubs;
        }),
        catchError(() => of(<Club[]>[])),
        tap((resp) => this.clubs.set(resp)),
        finalize(() => this.globalLoading.set(false)),
      );
  }

  loadDemoData() {
    this.productService.getProducts().then((data) => {
      this.products.set(data);
    });

    this.exportColumns = this.cols.map((col) => ({ title: col.header, dataKey: col.field }));
  }

  onGlobalFilter(event: Event) {
    const inputEl = event.target as HTMLInputElement;
    this.searchValue.setValue(inputEl.value);
  }

  openNew() {
    this.getClubs().subscribe(() => {
      this.headerDialog.set('Create event');
      this.product = {};
      this.submitted = false;
      this.productDialog = true;
    });
  }

  datePipe = inject(DatePipe);

  editProduct(event: EventReport) {
    this.getClubs().subscribe(() => {
      this.headerDialog.set('Edit event');
      this.form.patchValue({
        id: event.event_id,
        eventName: event.event_name,
        clubName: event.club_id,
        price: event.ticket_price,
        status: event.event_status,
        quantity: event.max_participants?.toString(),
        cureency: event.currency,
        date: this.datePipe.transform(event.event_datetime, 'dd.MM.yyyy'),
        time: this.datePipe.transform(event.event_datetime, 'shortTime'),
      });
      this.productDialog = true;
    });
  }

  deleteSelectedProducts() {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete the selected products?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        // this.products.set(this.products().filter((val) => !this.selectedProducts?.includes(val)));
        this.selectedProducts = null;
        this.messageService.add({
          severity: 'success',
          summary: 'Successful',
          detail: 'Products Deleted',
          life: 3000,
        });
      },
    });
  }

  hideDialog() {
    this.productDialog = false;
    this.submitted = false;
  }

  deleteProduct(event: EventReport) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete ' + event.event_name + '?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.globalLoading.set(true);
        this.httpClient
          .delete(`http://localhost:8000/server/api/events/${event.event_id}`)
          .pipe(
            delay(500),
            catchError(() => of(null)),
            finalize(() => this.globalLoading.set(false)),
          )
          .subscribe();
      },
    });
  }

  saveProduct() {
    if (this.headerDialog() === 'Create event') {
      this.createEvent().subscribe(() => {
        this.productDialog = false;
      });
    } else {
      this.editEvent().subscribe(() => {
        this.productDialog = false;
      });
    }
  }
}

export interface EventReport {
  event_id: string;
  event_name: string;
  club_name: string;
  club_id: string;
  event_datetime: string; // или Date если будет преобразование
  max_participants: number;
  event_status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  ticket_price: string; // или number если будет преобразование
  currency: string;
  registered_count: number;
}

export interface Club {
  id: number;
  name: string;
  status: 'Active' | 'Inactive';
  description: string;
  category: string;
  email: string;
  phone: string;
  captain_id: number | null;
  vice_captain_id: number | null;
  created_at: string;
  updated_at: string;
  captain_name: string | null;
  vice_captain_name: string | null;
}

export type CreateEventFormType = FormGroup<{
  id: FormControl<string | null>;
  eventName: FormControl<string | null>;
  clubName: FormControl<string | null>;
  date: FormControl<string | null>;
  time: FormControl<string | null>;
  quantity: FormControl<string | null>;
  status: FormControl<string | null>;
  price: FormControl<string | null>;
  cureency: FormControl<string | null>;
}>;
