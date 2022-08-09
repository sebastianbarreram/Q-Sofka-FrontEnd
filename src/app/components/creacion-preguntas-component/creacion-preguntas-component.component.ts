import { Component, OnInit } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { AreaConocimiento } from 'src/app/models/areaConocimiento';
import { HttpServiceAreaConocimientoService } from 'src/app/services/http-service-area-conocimiento.service';
import {
  FormGroup,
  FormControl,
  FormBuilder,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { Descriptor } from 'src/app/models/descriptor';

@Component({
  selector: 'app-creacion-preguntas-component',
  templateUrl: './creacion-preguntas-component.component.html',
  styleUrls: ['./creacion-preguntas-component.component.css'],
})
export class CreacionPreguntasComponentComponent implements OnInit {
  title = 'Agregar Pregunta';
  tiposPregunta: string[] = [];
  areasConocimiento: string[] = [];
  descriptores: string[] = [];
  opcionesTipoPregunta: string[] = [
    'Opción múltiple',
    'Única opción',
    'Verdadero o falso',
  ];
  opcionesAreaConocimiento?: AreaConocimiento[];
  opcionesDescriptores?: Descriptor[];
  opciones: string[] = [];
  opcion: string = '';
  tipoPregunta?: string;
  areaConocimientoNombre: string = '';
  areaConocimiento: AreaConocimiento;
  descriptor: string = 'Seleccione una opcion';
  pregunta?: string;
  preguntaForm: FormGroup;
  tieneOpcionesMultiples: boolean | null = null;
  botonAgregarOpcionDisable: boolean = true;
  requerimientosPregunta: ValidationErrors[] = [];

  constructor(
    private fb: FormBuilder,
    private cookieService: CookieService,
    private servicioHttpAreaConocimiento: HttpServiceAreaConocimientoService
  ) {
    this.preguntaForm = this.fb.group({
      tipoPreguntaForm: ['', Validators.required],
      areaConocimientoForm: ['', Validators.required],
      descriptorForm: ['', Validators.required],
      preguntaFormulario: [
        '',
        [
          Validators.required,
          this.validarPregunta,
          this.validarPreguntaCaracterFinal,
        ],
      ],
      opcionForm: [''],
    });
  }

  ngOnInit(): void {
    if (this.cookieService.get('tipoPreguntaForm') !== '') {
      this.tipoPregunta = this.cookieService.get('tipoPreguntaForm');
    }
    if (this.cookieService.get('areaConocimientoForm') !== '') {
      setTimeout(() => {
        this.areaConocimientoNombre = this.cookieService.get(
          'areaConocimientoForm'
        );
      }, 1000);
    }
    if (this.cookieService.get('descriptorForm') !== '') {
      this.descriptor = this.cookieService.get('descriptorForm');
    }
    if (JSON.parse(localStorage.getItem('opciones')!)) {
      this.opciones = JSON.parse(localStorage.getItem('opciones')!);
    }
    this.pregunta = this.cookieService.get('preguntaFormulario');
    this.obtenerAreasConocimiento();
  }

  // -------------------------------------------------------------------------------
  // Tipo de Pregunta
  // -------------------------------------------------------------------------------

  get tipopreguntaNoValida() {
    return (
      this.preguntaForm.get('tipoPreguntaForm')?.hasError('required') &&
      this.preguntaForm.get('tipoPreguntaForm')?.touched
    );
  }

  // -------------------------------------------------------------------------------
  // Area de Conocimiento
  // -------------------------------------------------------------------------------

  get areaConocimientoNoValida() {
    return (
      this.preguntaForm.get('areaConocimientoForm')?.hasError('required') &&
      this.preguntaForm.get('areaConocimientoForm')?.touched
    );
  }

  obtenerAreasConocimiento(): void {
    this.servicioHttpAreaConocimiento
      .listarAreaConocimiento()
      .subscribe((areas) => {
        this.opcionesAreaConocimiento = areas;
      });
  }

  obtenerAreaConocimientoForm(idAreaconocimiento: string) {
    console.log(idAreaconocimiento);
  }

  // -------------------------------------------------------------------------------
  // Descriptor
  // -------------------------------------------------------------------------------

  get descriptorNoValida() {
    return (
      this.preguntaForm.get('descriptorForm')?.hasError('required') &&
      this.preguntaForm.get('descriptorForm')?.touched
    );
  }

  obtenerDescriptor(areaConocimiento: AreaConocimiento): void {
    this.servicioHttpAreaConocimiento
      .listarDescriptor(areaConocimiento.id)
      .subscribe((descriptores) => {
        this.opcionesDescriptores = descriptores;
      });
  }

  // -------------------------------------------------------------------------------
  // Pregunta
  // -------------------------------------------------------------------------------

  get preguntaFormNoValida() {
    return (
      this.preguntaForm.get('preguntaFormulario')?.hasError('required') &&
      this.preguntaForm.get('preguntaFormulario')?.touched
    );
  }

  get verdaderoFalsoValido() {
    return (
      this.preguntaForm.get('preguntaFormulario')?.errors?.[
        'validarPreguntaVerdaderoFalso'
      ] && this.preguntaForm.get('preguntaFormulario')?.touched
    );
  }

  mostrarRequerimientoPregunta(opcion: string): void {
    if (opcion === 'Verdadero o falso') {
      this.tieneOpcionesMultiples = false;
    } else {
      this.tieneOpcionesMultiples = true;
    }
    this.obtenerRequerimiento();
  }

  private validarPregunta(control: AbstractControl): ValidationErrors | null {
    let pregunta = control.value;
    if (
      !pregunta.startsWith('¿Qué') &&
      !pregunta.startsWith('¿Cómo') &&
      !pregunta.startsWith('¿Dónde') &&
      !pregunta.startsWith('¿Cuál') &&
      !pregunta.startsWith('¿Es')
    ) {
      return { validarPregunta: true };
    } else {
      return null;
    }
  }

  private validarPreguntaVerdaderoFalso(
    control: AbstractControl
  ): ValidationErrors | null {
    let pregunta = control.value;
    if (!pregunta.startsWith('Verdadero') && !pregunta.startsWith('Falso')) {
      return { validarPreguntaVerdaderoFalso: true };
    } else {
      return null;
    }
  }

  private validarPreguntaCaracterFinal(
    control: AbstractControl
  ): ValidationErrors | null {
    let pregunta = control.value;
    if (!pregunta.endsWith('?')) {
      return { validarPreguntaCaracterFinal: true };
    } else {
      return null;
    }
  }

  obtenerRequerimiento(): void {
    if (!this.tieneOpcionesMultiples) {
      this.preguntaForm.controls['preguntaFormulario'].setValidators([
        Validators.required,
        this.validarPreguntaVerdaderoFalso,
      ]);
    } else {
      this.preguntaForm.controls['preguntaFormulario'].setValidators([
        Validators.required,
        this.validarPregunta,
        this.validarPreguntaCaracterFinal,
      ]);
    }
  }

  // -------------------------------------------------------------------------------
  // Opcion
  // -------------------------------------------------------------------------------

  persistirOpcion(namekey: string) {
    let value = '';
    if (namekey === 'areaConocimientoForm')
      value =
        this.preguntaForm.value.areaConocimientoForm.nombreAreaConocimiento;
    if (namekey === 'tipoPreguntaForm')
      value = this.preguntaForm.value.tipoPreguntaForm;
    if (namekey === 'descriptorForm')
      value = this.preguntaForm.value.descriptorForm;
    if (namekey === 'preguntaFormulario')
      value = this.preguntaForm.value.preguntaFormulario;

    this.cookieService.set(
      namekey,
      value,
      this.obtenerLimiteCookie(new Date())
    );
  }

  obtenerLimiteCookie(fecha: Date): Date {
    return new Date(Date.parse(fecha.toString()) + 1200000);
  }

  validarOpcion(): void {
    if (this.preguntaForm.value.opcionForm) {
      this.botonAgregarOpcionDisable = false;
    } else {
      this.botonAgregarOpcionDisable = true;
    }
    if (this.opciones.length >= 4) {
      this.botonAgregarOpcionDisable = true;
    }
  }

  agregarEditarOpcion() {
    let indice = this.cookieService.get('opcionEditar');
    if (indice) {
      this.opciones[parseInt(indice!)] = this.opcion;
      localStorage.setItem('opciones', JSON.stringify(this.opciones));
      this.opcion = '';
    } else {
      this.opciones.push(this.opcion!);
      localStorage.setItem('opciones', JSON.stringify(this.opciones));
      this.opcion = '';
    }
    this.cookieService.delete('opcionEditar');
  }

  eliminarOpcion(opcion: string) {
    let item = this.opciones.findIndex((element) => element == opcion);
    this.opciones.splice(item, 1);
    localStorage.setItem('opciones', JSON.stringify(this.opciones));
    console.log(item);
  }

  editarOpcion(indice: number) {
    this.botonAgregarOpcionDisable = false;
    this.opcion = this.opciones[indice];
    this.cookieService.set(
      'opcionEditar',
      indice.toString(),
      this.obtenerLimiteCookie(new Date())
    );
  }

  // -------------------------------------------------------------------------------
  // Botones guardar, validarGuardarPregunta y Regresar
  // -------------------------------------------------------------------------------
  validarGuardarPregunta(opciones: number, tipoPregunta: string) {
    let mensajeMultipleUnicaOpcion;
    let mensajeVerdaderoFalso;
    mensajeMultipleUnicaOpcion =
      (tipoPregunta == 'Opción múltiple' || tipoPregunta == 'Única opción') &&
      opciones == 4
        ? true
        : false;
    mensajeVerdaderoFalso =
      tipoPregunta == 'Verdadero o falso' && opciones == 2 ? true : false;
    return tipoPregunta == 'Verdadero o falso'
      ? mensajeVerdaderoFalso
      : mensajeMultipleUnicaOpcion;
  }

  guardarPregunta() {
    const tipoPreguntaValue = this.preguntaForm.value.tipoPreguntaForm;
    const areaConocimientoValue = this.preguntaForm.value.areaConocimientoForm;
    const descriptorValue = this.preguntaForm.value.descriptorForm;
    const preguntaFormularioValue = this.preguntaForm.value.preguntaFormulario;
    let opciones = this.opciones.length;
    let mensaje = this.validarGuardarPregunta(opciones, tipoPreguntaValue);
    if (mensaje) {
      console.log('desde guardar pregunta es valido');
    } else {
      console.log('desde guardar pregunta es invalido');
    }
  }
}
