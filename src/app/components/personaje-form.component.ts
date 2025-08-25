import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { PersonajesLocalService, Personaje } from '../services/personajes-local.service';

@Component({
  selector: 'app-personaje-form',
  templateUrl: './personaje-form.component.html'
})
export class PersonajeFormComponent {
  /** Si se pasa un personaje, el formulario se inicializa para edición */
  @Input() personaje?: Personaje | null;
  /** Evento que se lanza al guardar (creación o actualización) */
  @Output() guardado = new EventEmitter<Personaje>();
  /** Evento para cancelar (ocultar formulario) */
  @Output() cancelado = new EventEmitter<void>();

  form = this.fb.group({
    nombre: ['', [Validators.required, Validators.maxLength(100)]],
    especie: ['', [Validators.required, Validators.maxLength(100)]],
    genero: ['', [Validators.required, Validators.maxLength(50)]],
    base_ki: [0, [Validators.required, Validators.min(0)]],
    total_ki: [0, [Validators.required, Validators.min(0)]],
    afiliacion: ['', [Validators.required, Validators.maxLength(100)]],
    descripcion: [''],
    imagen_url: ['']
  });
  file?: File;
  preview: string | null = null;
  loading = false;

  constructor(private fb: FormBuilder, private svc: PersonajesLocalService) {}

  ngOnChanges() {
    if (this.personaje) {
      this.form.patchValue({
        nombre: this.personaje.nombre,
        especie: this.personaje.especie,
        genero: this.personaje.genero,
        base_ki: this.personaje.base_ki,
        total_ki: this.personaje.total_ki,
        afiliacion: this.personaje.afiliacion,
        descripcion: this.personaje.descripcion ?? '',
        imagen_url: this.personaje.imagen_url ?? ''
      });
      this.preview = this.personaje.imagen_src || this.personaje.imagen_url || null;
    } else {
      this.form.reset();
      this.preview = null;
      this.file = undefined;
    }
  }

  seleccionarArchivo(ev: Event) {
    const input = ev.target as HTMLInputElement;
    if (!input.files || !input.files.length) return;
    this.file = input.files[0];
    const reader = new FileReader();
    reader.onload = () => (this.preview = reader.result as string);
    reader.readAsDataURL(this.file);
  }

  quitarArchivo() {
    this.file = undefined;
    this.preview = this.form.value.imagen_url || null;
  }

  guardar() {
  if (this.form.invalid) return;
  this.loading = true;

  // this.form.value tiene string | null; lo normalizamos a tipos válidos
  const f = this.form.value;
  const data: Partial<Personaje> = {
    nombre: f.nombre ?? '',
    especie: f.especie ?? '',
    genero: f.genero ?? '',
    afiliacion: f.afiliacion ?? '',
    descripcion: f.descripcion ?? '',
    imagen_url: f.imagen_url ?? undefined,
    base_ki: Number(f.base_ki ?? 0),
    total_ki: Number(f.total_ki ?? 0),
  };

  const obs = this.personaje
    ? (this.file
        ? this.svc.updateForm(this.personaje.id!, data, this.file)
        : this.svc.updateJSON(this.personaje.id!, data))
    : (this.file
        ? this.svc.createForm(data, this.file)
        : this.svc.createJSON(data));

  obs.subscribe({
    next: (p) => {
      this.loading = false;
      this.guardado.emit(p);
    },
    error: (err) => {
      this.loading = false;
      console.error(err);
      alert('Error al guardar el personaje');
    }
  });
}
}
