from finance.models import Transaction
from django import forms


class TransactionForm(forms.ModelForm):
    class Meta:
        model = Transaction
        fields = "__all__"

    def clean_reference(self):
        means = self.cleaned_data.get("means")
        reference = self.cleaned_data.get("reference")
        if means == Transaction.TransactionMeans.CASH.value:
            if reference != "--":
                raise forms.ValidationError(
                    "Reference should be '--' if transaction means is Cash"
                )
        else:
            if reference:
                if reference == "--":
                    raise forms.ValidationError(
                        "Reference cannot be '--' if means is not Cash."
                    )
            else:
                raise forms.ValidationError("Reference is required.")
        return reference
