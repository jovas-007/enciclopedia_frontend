import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { PersonajesLocalService, Personaje } from '../services/personajes-local.service';

/** Valida que exista al menos una imagen (URL o archivo) */
export const imagenRequeridaValidator: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
  const url  = (group.get('imagen_url')?.value ?? '').toString().trim();
  const file = group.get('imagen_file')?.value ?? null;
  return (url || file) ? null : { imagenRequerida: true };
};

@Component({
  selector: 'app-personaje-form',
  templateUrl: './personaje-form.component.html'
})
export class PersonajeFormComponent {
  @Input() personaje?: Personaje | null;
  @Output() guardado = new EventEmitter<Personaje>();
  @Output() cancelado = new EventEmitter<void>();

  form = this.fb.group({
    nombre: ['', [Validators.required, Validators.maxLength(100)]],
    especie: ['', [Validators.required, Validators.maxLength(100)]],
    genero: ['', [Validators.required]],

    // numéricos (tipo number) + min; el pattern se refuerza desde el input del HTML
    base_ki: [0, [Validators.required, Validators.min(0)]],
    total_ki: [0, [Validators.required, Validators.min(0)]],

    afiliacion: ['', [Validators.required, Validators.maxLength(100)]],

    descripcion: ['', [Validators.required]],

    // OJO: ya no es required, porque la condición es (URL || archivo)
    imagen_url: [''],

    // nuevo control para el archivo
    imagen_file: [null as File | null]
  }, { validators: [imagenRequeridaValidator] });

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
        imagen_url: this.personaje.imagen_url ?? '',
        imagen_file: null
      });
      this.preview = this.personaje.imagen_src || this.personaje.imagen_url || null;
    } else {
      this.form.reset();
      this.preview = null;
      this.file = undefined;
    }
    this.form.updateValueAndValidity(); // revalida la regla URL || archivo
  }

  seleccionarArchivo(ev: Event) {
    const input = ev.target as HTMLInputElement;
    if (!input.files || !input.files.length) return;
    this.file = input.files[0];

    // reflejar en el control
    this.form.get('imagen_file')?.setValue(this.file);
    this.form.get('imagen_file')?.markAsDirty();
    this.form.updateValueAndValidity();

    const reader = new FileReader();
    reader.onload = () => (this.preview = reader.result as string);
    reader.readAsDataURL(this.file);
  }

  quitarArchivo() {
    this.file = undefined;
    this.form.get('imagen_file')?.setValue(null);
    this.form.get('imagen_file')?.markAsDirty();
    this.form.updateValueAndValidity();

    this.preview = this.form.value.imagen_url || null;
  }

  guardar() {
    if (this.form.invalid) return;
    this.loading = true;

    // sanea strings (quita espacios)
    Object.keys(this.form.controls).forEach(k => {
      const c = this.form.get(k);
      if (typeof c?.value === 'string') c.setValue(c.value.trim());
    });

    const f = this.form.value;
    const data: Partial<Personaje> = {
      nombre: f.nombre ?? '',
      especie: f.especie ?? '',
      genero: f.genero ?? '',
      afiliacion: f.afiliacion ?? '',
      descripcion: f.descripcion ?? '',
      imagen_url: (f.imagen_url || undefined),
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
      next: (p) => { this.loading = false; this.guardado.emit(p); },
      error: (err) => { this.loading = false; console.error(err); alert('Error al guardar el personaje'); }
    });
  }
}
