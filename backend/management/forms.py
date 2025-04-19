from django import forms
from management.models import AppUtility
import re


class AppUtilityForm(forms.ModelForm):

    class Meta:
        model = AppUtility
        fields = "__all__"

    def clean_value(self):
        name = self.cleaned_data.get("name")
        value = self.cleaned_data.get("value")
        if name in (
            AppUtility.UtilityName.RENT_PAYMENT_DATE_REMINDER.value,
            AppUtility.UtilityName.RENT_PAYMENT_END_DATE.value,
            AppUtility.UtilityName.RENT_PAYMENT_START_DATE.value,
        ):
            if re.match(r"^\d{1,2}$", value) is None:
                raise forms.ValidationError(
                    f"Value for {name} must be a number in the range 1 to 31."
                )
        return value
