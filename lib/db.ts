import Dexie, { type EntityTable, type Table } from 'dexie';

// ==========================================
// 1. INTERFACES DE TYPESCRIPT
// ==========================================

export interface SyncQueueItem {
    id?: number;
    table_name: 'animals' | 'growth_events' | 'services' | 'pregnancy_checks' | 'health_records';
    operation: 'INSERT' | 'UPDATE' | 'DELETE';
    payload: any;
    created_at: string;
    status: 'PENDING' | 'ERROR';
    error_message?: string;
}

export interface Animal {
    id: string;
    user_id: string;
    number: string;
    birth_date?: string | null;
    sex?: 'Macho' | 'Hembra' | null;
    
    // --- NUEVOS CAMPOS FASE 1 ---
    status?: 'Activo' | 'Inactivo';
    inactivity_reason?: string | null;
    photo_path?: string | null; // URL de Supabase (Online)
    photo_blob?: Blob | null;   // Archivo binario para uso (Offline)
    // -----------------------------

    mother_id?: string | null;
    father_id?: string | null;
    birth_weight_kg?: number | null;
    origin_service_id?: string | null;
    color?: string | null;
    observations?: string | null;
    
    // Denormalización para consultas rápidas
    last_weight_kg?: number | null;
    last_weight_date?: string | null;

    created_at: string;
    updated_at: string;
    deleted_at?: string | null;
}

export interface Service {
    id: string;
    user_id: string;
    mother_id: string;
    father_id?: string | null;
    type_conception?: string | null;
    service_date: string;

    created_at: string;
    updated_at: string;
    deleted_at?: string | null;
}

export interface PregnancyCheck {
    id: string;
    user_id: string;
    animal_id: string;
    service_id?: string | null;
    check_date: string;
    result: 'Preñada' | 'Vacía';
    observations?: string | null;

    created_at: string;
    updated_at: string;
    deleted_at?: string | null;
}

export interface HealthRecord {
    id: string;
    user_id: string;
    animal_id: string;
    batch_id?: string | null;
    product_type: 'Vacuna' | 'Desparasitante' | 'Vitamina' | 'Antibiótico';
    product_name: string;
    dose?: string | null;
    application_date: string;

    created_at: string;
    updated_at: string;
    deleted_at?: string | null;
}

export interface GrowthEvent {
    id: string;
    user_id: string;
    animal_id: string;
    event_type: string;
    event_date: string;
    weight_kg?: number | null;
    mother_weight_kg?: number | null;
    scrotal_circumference_cm?: number | null;
    navel_length?: string | null;
    observations?: string | null;

    // --- NUEVOS CAMPOS FASE 1 ---
    photo_path?: string | null; // URL de Supabase (Online)
    photo_blob?: Blob | null;   // Archivo binario para uso (Offline)
    // -----------------------------

    created_at: string;
    updated_at: string;
    deleted_at?: string | null;
}

// ==========================================
// 2. CONFIGURACIÓN DE LA BASE DE DATOS DEXIE
// ==========================================

export class GanaderaDB extends Dexie {
    // Declaración de las tablas locales
    animals!: Table<Animal, string>;
    services!: Table<Service, string>;
    pregnancy_checks!: Table<PregnancyCheck, string>;
    health_records!: Table<HealthRecord, string>;
    growth_events!: Table<GrowthEvent, string>;
    sync_queue!: Table<SyncQueueItem, number>;

    constructor() {
        super('GanaderaDB');

        // IMPORTANTE: Aquí NO van todas las columnas. 
        // Solo van: la llave primaria (id), y los campos por los que vamos a filtrar.
        this.version(1).stores({
            animals: 'id, user_id, number, mother_id, father_id, origin_service_id, updated_at, deleted_at',
            services: 'id, user_id, mother_id, father_id, service_date, updated_at, deleted_at',
            pregnancy_checks: 'id, user_id, animal_id, service_id, updated_at, deleted_at',
            health_records: 'id, user_id, animal_id, batch_id, updated_at, deleted_at',
            growth_events: 'id, user_id, animal_id, event_date, updated_at, deleted_at'
        });

        // Versión 2: Agregamos la cola de sincronización
        this.version(2).stores({
            sync_queue: '++id, table_name, status, created_at'
        });

        // Versión 3: Indexamos 'sex'
        this.version(3).stores({
            animals: 'id, user_id, number, sex, mother_id, father_id, origin_service_id, updated_at, deleted_at'
        });

        // Versión 4: Indexamos campos de peso
        this.version(4).stores({
            animals: 'id, user_id, number, sex, last_weight_kg, last_weight_date, mother_id, father_id, updated_at, deleted_at'
        });

        // --- FASE 1: NUEVA VERSIÓN 5 ---
        // Indexamos 'status' por si en el futuro queremos filtrar "Mostrar solo animales activos"
        this.version(5).stores({
            animals: 'id, user_id, number, status, sex, last_weight_kg, last_weight_date, mother_id, father_id, updated_at, deleted_at'
        }).upgrade(tx => {
            // Migración: Asignar 'Activo' a los animales que ya estaban en el teléfono antes de esta actualización
            return tx.table('animals').toCollection().modify(animal => {
                if (!animal.status) {
                    animal.status = 'Activo';
                }
            });
        });
    }
}

// Exportamos una única instancia para usarla en toda la app
export const db = new GanaderaDB();