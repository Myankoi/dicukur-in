package com.dicukur.app.views.components;

import com.vaadin.flow.component.html.Div;
import com.vaadin.flow.component.html.H3;
import com.vaadin.flow.component.html.Paragraph;
import com.vaadin.flow.component.orderedlayout.VerticalLayout;

public abstract class PlaceholderPage extends VerticalLayout {

    protected PlaceholderPage(String title, String subtitle) {
        addClassName("page-container");
        setPadding(false);
        setSpacing(false);

        Div section = new Div(
                new H3("Dalam Pengembangan"),
                new Paragraph("Halaman ini sudah disiapkan untuk milestone berikutnya.")
        );
        section.addClassName("dashboard-section");

        add(new PageHeader(title, subtitle), section);
    }
}
