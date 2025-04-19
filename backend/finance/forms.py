from finance.models import Transaction
from django import forms
import re


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
                if re.match(r"[\w\d_-]{4,}", reference) is None:
                    raise forms.ValidationError(
                        "Reference must be at least 4 characters long containing"
                        " alphanumeric, underscore and hyphen."
                    )
            else:
                raise forms.ValidationError("Reference is required.")
        return reference
