import { Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
import { catchError, delay, finalize, map } from 'rxjs/operators';
import { of } from 'rxjs';
import { Skeleton } from 'primeng/skeleton';

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
  ],
  template: `
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
                (input)="onGlobalFilter(dt, $event)"
                placeholder="Search..."
              />
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
              <td style="min-width: 16rem">
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
              {{event.registered_count}} / {{event.max_participants}}
            </td>
            <td>
              <p-tag
                [value]="event.event_status"
                [severity]="eventStatusSaverity[event.event_status]"
              ></p-tag>
            </td>
            <td>
              {{ event.ticket_price }} {{ event.currency }}
            </td>
            <td>
              <p-button
                icon="pi pi-pencil"
                class="mr-2"
                [rounded]="true"
                [outlined]="true"
                (click)="editProduct(product)"
              />
              <p-button
                icon="pi pi-trash"
                severity="danger"
                [rounded]="true"
                [outlined]="true"
                (click)="deleteProduct(product)"
              />
            </td>
          </tr>
        </ng-template>
      </p-table>
    }

    <p-dialog
      [(visible)]="productDialog"
      [style]="{ width: '450px' }"
      header="Product Details"
      [modal]="true"
    >
      <ng-template #content>
        <div class="flex flex-col gap-6">
          <img
            [src]="'https://primefaces.org/cdn/primeng/images/demo/product/' + product.image"
            [alt]="product.image"
            class="block m-auto pb-4"
            *ngIf="product.image"
          />
          <div>
            <label
              for="name"
              class="block font-bold mb-3"
              >Name</label
            >
            <input
              type="text"
              pInputText
              id="name"
              [(ngModel)]="product.name"
              required
              autofocus
              fluid
            />
            <small
              class="text-red-500"
              *ngIf="submitted && !product.name"
              >Name is required.</small
            >
          </div>
          <div>
            <label
              for="description"
              class="block font-bold mb-3"
              >Description</label
            >
            <textarea
              id="description"
              pTextarea
              [(ngModel)]="product.description"
              required
              rows="3"
              cols="20"
              fluid
            ></textarea>
          </div>

          <div>
            <label
              for="inventoryStatus"
              class="block font-bold mb-3"
              >Inventory Status</label
            >
            <p-select
              [(ngModel)]="product.inventoryStatus"
              inputId="inventoryStatus"
              [options]="statuses"
              optionLabel="label"
              optionValue="label"
              placeholder="Select a Status"
              fluid
            />
          </div>

          <div>
            <span class="block font-bold mb-4">Category</span>
            <div class="grid grid-cols-12 gap-4">
              <div class="flex items-center gap-2 col-span-6">
                <p-radiobutton
                  id="category1"
                  name="category"
                  value="Accessories"
                  [(ngModel)]="product.category"
                />
                <label for="category1">Accessories</label>
              </div>
              <div class="flex items-center gap-2 col-span-6">
                <p-radiobutton
                  id="category2"
                  name="category"
                  value="Clothing"
                  [(ngModel)]="product.category"
                />
                <label for="category2">Clothing</label>
              </div>
              <div class="flex items-center gap-2 col-span-6">
                <p-radiobutton
                  id="category3"
                  name="category"
                  value="Electronics"
                  [(ngModel)]="product.category"
                />
                <label for="category3">Electronics</label>
              </div>
              <div class="flex items-center gap-2 col-span-6">
                <p-radiobutton
                  id="category4"
                  name="category"
                  value="Fitness"
                  [(ngModel)]="product.category"
                />
                <label for="category4">Fitness</label>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-12 gap-4">
            <div class="col-span-6">
              <label
                for="price"
                class="block font-bold mb-3"
                >Price</label
              >
              <p-inputnumber
                id="price"
                [(ngModel)]="product.price"
                mode="currency"
                currency="USD"
                locale="en-US"
                fluid
              />
            </div>
            <div class="col-span-6">
              <label
                for="quantity"
                class="block font-bold mb-3"
                >Quantity</label
              >
              <p-inputnumber
                id="quantity"
                [(ngModel)]="product.quantity"
                fluid
              ></p-inputnumber>
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
          label="Save"
          icon="pi pi-check"
          (click)="saveProduct()"
        />
      </ng-template>
    </p-dialog>

    <p-confirmdialog [style]="{ width: '450px' }"></p-confirmdialog>
  `,
  providers: [MessageService, ProductService, ConfirmationService],
})
export class Events implements OnInit {
  productDialog: boolean = false;

  products = signal<Product[]>([]);

  product!: Product;

  selectedProducts!: EventReport[] | null;

  submitted: boolean = false;

  statuses!: any[];

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

  loading = signal(true);

  events = signal<EventReport[]>([]);
  userRoleSaverity: any = {
    member: 'info',
    admin: 'danger',
    club_owner: 'warn',
  };
  eventStatusSaverity: any = {
      scheduled: 'warn',
      ongoing: 'info',
      completed: 'success',
      cancelled: 'danger'
  }

  private httpClient = inject(HttpClient);

  constructor(
    private productService: ProductService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
  ) {}

  exportCSV() {
    this.dt.exportCSV();
  }

  ngOnInit() {
    this.loadDemoData();
    this.getEvents();
  }

  getEvents() {
    this.loading.set(true);
    this.httpClient
      .get<
        IGeneralResponse<EventReport[]>
      >('http://localhost:8000/server/api/events/report')
      .pipe(
        delay(500),
        map(({ data }) => {
          if (!data) return <EventReport[]>[];
          return data;
        }),
        catchError(() => of(<EventReport[]>[])),
        finalize(() => this.loading.set(false)),
      )
      .subscribe((resp) => this.events.set(resp));
  }

  loadDemoData() {
    this.productService.getProducts().then((data) => {
      this.products.set(data);
    });

    this.statuses = [
      { label: 'INSTOCK', value: 'instock' },
      { label: 'LOWSTOCK', value: 'lowstock' },
      { label: 'OUTOFSTOCK', value: 'outofstock' },
    ];

    this.exportColumns = this.cols.map((col) => ({ title: col.header, dataKey: col.field }));
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  openNew() {
    this.product = {};
    this.submitted = false;
    this.productDialog = true;
  }

  editProduct(product: Product) {
    this.product = { ...product };
    this.productDialog = true;
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

  deleteProduct(product: Product) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete ' + product.name + '?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.products.set(this.products().filter((val) => val.id !== product.id));
        this.product = {};
        this.messageService.add({
          severity: 'success',
          summary: 'Successful',
          detail: 'Product Deleted',
          life: 3000,
        });
      },
    });
  }

  findIndexById(id: string): number {
    let index = -1;
    for (let i = 0; i < this.products().length; i++) {
      if (this.products()[i].id === id) {
        index = i;
        break;
      }
    }

    return index;
  }

  createId(): string {
    let id = '';
    var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (var i = 0; i < 5; i++) {
      id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
  }

  saveProduct() {
    this.submitted = true;
    let _products = this.products();
    if (this.product.name?.trim()) {
      if (this.product.id) {
        _products[this.findIndexById(this.product.id)] = this.product;
        this.products.set([..._products]);
        this.messageService.add({
          severity: 'success',
          summary: 'Successful',
          detail: 'Product Updated',
          life: 3000,
        });
      } else {
        this.product.id = this.createId();
        this.product.image = 'product-placeholder.svg';
        this.messageService.add({
          severity: 'success',
          summary: 'Successful',
          detail: 'Product Created',
          life: 3000,
        });
        this.products.set([..._products, this.product]);
      }

      this.productDialog = false;
      this.product = {};
    }
  }
}

export interface EventReport {
    event_name: string;
    club_name: string;
    event_datetime: string; // или Date если будет преобразование
    max_participants: number;
    event_status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
    ticket_price: string; // или number если будет преобразование
    currency: string;
    registered_count: number;
}
