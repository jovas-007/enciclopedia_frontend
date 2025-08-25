import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Personaje } from '../services/personajes-local.service';

@Component({
  selector: 'app-personaje-form-dialog',
  templateUrl: './personaje-form-dialog.component.html'
})
export class PersonajeFormDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { personaje: Personaje | null },
    private dialogRef: MatDialogRef<PersonajeFormDialogComponent>
  ) {}

  onGuardado(p: Personaje) { this.dialogRef.close(p); }
  onCancel() { this.dialogRef.close(null); }
}
