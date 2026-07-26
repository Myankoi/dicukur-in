package com.dicukur.app.views.components;

import com.vaadin.flow.component.html.Div;
import com.vaadin.flow.component.html.Span;

public class MetricCard extends Div {

    public MetricCard(String label, String value, String description) {
        addClassName("metric-card");

        Span labelText = new Span(label);
        labelText.addClassName("metric-label");

        Div valueText = new Div(value);
        valueText.addClassName("metric-value");

        Span descriptionText = new Span(description);
        descriptionText.addClassName("metric-description");

        add(labelText, valueText, descriptionText);
    }
}
