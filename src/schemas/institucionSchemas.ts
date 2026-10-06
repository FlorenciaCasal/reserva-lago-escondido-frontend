import * as yup from "yup";
import { PHONE_RE } from "./formSchema";
import { NAME_RE } from "./formSchema";
import { LETTERS_LEN } from "./formSchema";

const INSTITUTION_NAME_RE = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9][A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9 .,'°ºª#&()/-]*$/;

export const institucionSchema = yup.object({
    institucion: yup.string().transform(v => String(v ?? "").trim())
        .required("Completá el nombre de la institución.")
        .matches(INSTITUTION_NAME_RE, "Nombre de la institución inválido.")
        .test("min-letters", "Nombre de la institución inválido: mínimo 3 letras.", v => LETTERS_LEN(v || "") >= 3),
    institucionLocalidad: yup.string().transform(v => String(v ?? "").trim())
        .required("Completá la localidad.")
        .matches(NAME_RE, "Localidad inválida: No se aceptan números ni carateres especiales.")
        .test("min-letters", "Localidad inválida: mínimo 3 letras.", v => LETTERS_LEN(v || "") >= 3),
    institucionEmail: yup.string().transform(v => String(v ?? "").trim())
        .required("Completá el email.")
        .email("Email inválido."),
    institucionTelefono: yup.string().transform(v => String(v ?? "").trim())
        .required("Completá el teléfono.")
        .matches(PHONE_RE, "Teléfono inválido."),
    responsableNombre: yup.string().transform(v => String(v ?? "").trim())
        .required("Completá el nombre del/la responsable.")
        .matches(NAME_RE, "Nombre inválido: No se aceptan números ni carateres especiales.")
        .test("min-letters", "Nombre inválido: mínimo 3 letras.", v => LETTERS_LEN(v || "") >= 3),
    responsableApellido: yup.string().transform(v => String(v ?? "").trim())
        .required("Completá el apellido del/la responsable.")
        .matches(NAME_RE, "Apellido inválido: No se aceptan números ni carateres especiales.")
        .test("min-letters", "Apellido inválido: mínimo 3 letras.", v => LETTERS_LEN(v || "") >= 3),
    responsableDni: yup.string()
        .transform(v => String(v ?? "").replace(/\D+/g, ""))
        .required("Completá el DNI del/la responsable.")
        .matches(/^\d{8}$/, "DNI inválido: deben ser exactamente 8 dígitos."),
}).required();
