"use strict";
var KTSigninGeneral = (function () {
  var t, e, r;
  return {
    init: function () {
      (t = document.querySelector("#login")),
        (e = document.querySelector("#kt_sign_in_submit")),
        (r = FormValidation.formValidation(t, {
          fields: {
            email: {
              validators: {
                regexp: {
                  regexp: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "The value is not a valid email address",
                },
                notEmpty: { message: "Email address is required" },
              },
            },
            password: {
              validators: { notEmpty: { message: "The password is required" } },
            },
          },
          plugins: {
            trigger: new FormValidation.plugins.Trigger(),
            bootstrap: new FormValidation.plugins.Bootstrap5({
              rowSelector: ".fv-row",
              eleInvalidClass: "",
              eleValidClass: "",
            }),
          },
        }))
    }
  };
})();
KTUtil.onDOMContentLoaded(function () {
  KTSigninGeneral.init();
});
