var express = require('express');

var fileUpload = require('express-fileupload');
var fs = require('fs')

var app = express();

// default options
app.use(fileUpload());

var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');



app.put('/:tipo/:id', (req, res, next) => {

    var tipo = req.params.tipo;
    var id = req.params.id;

    // Tipos de coleccion
    var tipoValidos = ['hospitales', 'medicos', 'usuarios'];
    if (tipoValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Tipo de coleccion no es valida',
            errors: { message: 'Tipo de collecion no es valida' }
        });
    }

    if (!req.files) {
        return res.status(400).json({
            ok: false,
            mensaje: 'No seleciono nada',
            errors: { message: 'Deve de selecionar una imagen' }
        });
    }

    // Obtener nombre del archivo
    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var extensionArchivo = nombreCortado[nombreCortado.length - 1].toLowerCase();

    // Solo estas extensiones aceptamos
    var extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];


    if (extensionesValidas.indexOf(extensionArchivo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Estension no valida',
            errors: { message: 'Las extensiones validas son ' + extensionesValidas.join(', ') }
        });
    }

    // Nombre de archivo personalizado
    var nombreArchivo = `${ id }-${ new Date().getMilliseconds() }.${ extensionArchivo }`;


    // Mover el archivo del temporal a um path
    var path = `./uploads/${ tipo }/${ nombreArchivo }`;


    archivo.mv(path, err => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al mover archivo',
                errors: err
            });
        }
        subirPorTipo(tipo, id, nombreArchivo, res);

        // res.status(200).json({
        //     ok: true,
        //     mensaje: 'Archivo movido',
        //     extensionArchivo: extensionArchivo
        // });

    });


});



function subirPorTipo(tipo, id, nombreArchivo, res) {

    if (tipo === 'usuarios') {

        Usuario.findById(id, (err, usuario) => {

            if (!usuario) {
                return res.status(404).json({
                    ok: false,
                    mensaje: 'Usuario no existe',
                    errors: { message: 'Usuario no existe' }
                });
            }

            var pathViejo = './uploads/usuarios/' + usuario.img;


            // si existe existe la img anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo);

            }

            usuario.img = nombreArchivo;

            usuario.save((err, usuarioActualizado) => {

                usuarioActualizado.password = ':)';

                res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de usuario actualizado',
                    usuario: usuarioActualizado
                });

            });

        });

    }
    if (tipo === 'medicos') {

        Medico.findById(id, (err, medico) => {

            if (!medico) {
                return res.status(404).json({
                    ok: false,
                    mensaje: 'Medico no existe',
                    errors: { message: 'Medico no existe' }
                });
            }

            var pathViejo = './uploads/medicos/' + medico.img;


            // si existe existe la img anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo);

            }

            medico.img = nombreArchivo;

            medico.save((err, medicoActualizado) => {

                res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de medico actualizado',
                    usuario: medicoActualizado
                });

            });

        });

    }
    if (tipo === 'hospitales') {

        Hospital.findById(id, (err, hospital) => {

            if (!hospital) {
                return res.status(404).json({
                    ok: false,
                    mensaje: 'Hospital no existe',
                    errors: { message: 'Hospital no existe' }
                });
            }

            var pathViejo = './uploads/medicos/' + hospital.img;


            // si existe existe la img anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo);

            }

            hospital.img = nombreArchivo;

            hospital.save((err, hospitalActualizado) => {

                res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de hospital actualizado',
                    usuario: hospitalActualizado
                });

            });

        });

    }

}

module.exports = app;