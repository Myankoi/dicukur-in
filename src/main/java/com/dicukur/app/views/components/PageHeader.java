package com.dicukur.app.views.components;

import com.vaadin.flow.component.html.H2;
import com.vaadin.flow.component.html.Paragraph;
import com.vaadin.flow.component.orderedlayout.VerticalLayout;

public class PageHeader extends VerticalLayout {

    public PageHeader(String title, String subtitle) {
        addClassName("page-header");
        setPadding(false);
        setSpacing(false);
        setWidthFull();

        H2 titleText = new H2(title);
        titleText.addClassName("page-title");

        Paragraph subtitleText = new Paragraph(subtitle);
        subtitleText.addClassName("page-subtitle");

        add(titleText, subtitleText);
    }
}
